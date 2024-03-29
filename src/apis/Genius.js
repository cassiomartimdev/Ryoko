const { APIWrapper } = require('../')
const fetch = require('node-fetch')
const cheerio = require('cheerio')
require('dotenv').config()

const API_URL = 'https://api.genius.com'

module.exports = class GeniusAPI extends APIWrapper {
  constructor () {
    super({
      name: 'genius',
      envVars: ['GENIUS_API']
    })
  }

  // Find a track
  findTrack (q) {
    return this.request('/search', { q })
  }

  // Load lyrics from the html
  loadLyrics (url) {
    return fetch(url).then(r => {
      const $ = cheerio.load(r.body)
      return $('.lyrics') ? $('.lyrics').text().trim() : null
    })
  }

  // Default
  request (endpoint, queryParams = {}) {
    const qParams = new URLSearchParams(queryParams)
    return fetch(API_URL + endpoint + `?${qParams.toString()}`, {
      headers: { 'Authorization': `Bearer ${process.env.GENIUS_API}` }
    }).then(res => res.json())
  }
}