const { Loader, Listener, FileUtils } = require('../')

module.exports = class ListenerLoader extends Loader {
    constructor (client) {
        super(client)
        this.critical = true

        this.listeners = []
    }

    async load () {
        try {
            await this.initializeListeners()
            this.client.listeners = this.listeners
            return true
        } catch (e) {
            this.logError(e)
        }
        return false
    }

    /**
     * Initializes all Client listeners.
     * @param {string} dirPath - Path to the listeners directory
     */
    initializeListeners (dirPath = 'src/listeners') {
        let success = 0
        let failed = 0
        return FileUtils.requireDirectory(dirPath, (NewListener) => {
            if (Object.getPrototypeOf(NewListener) !== Listener) return
            this.addListener(new NewListener(this.client)) ? success++ : failed++
        }, this.logError.bind(this)).then(() => {
            this.log(failed ? `[33m${success} listeners loaded, ${failed} failed.` : `[32mAll ${success} listeners loaded without errors.`, 'Listeners')
        })
    }

    /**
     * Adds a new listener to the Client.
     * @param {EventListener} listener - Listener to be added
     */
    addListener (listener) {
        if (!(listener instanceof Listener)) {
            this.log(`[31m${listener.name} failed to load - Not an EventListener`, 'Listeners')
            return false
        }

        const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1)
        listener.events.forEach(event => {
            this.client.on(event, listener['on' + capitalize(event)])
        })

        this.listeners.push(listener)
        return true
    }
}