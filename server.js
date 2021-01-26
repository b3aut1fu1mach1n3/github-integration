const express = require('express')
const axios = require('axios')
const Twit = require('twit')
const fs = require('fs').promises
const { lstat } = require('fs')
const { raw } = require('express')
const { start } = require('repl')

require('dotenv').config()

const T = new Twit({
    consumer_key: process.env.API_KEY,
    consumer_secret: process.env.API_SECRET_KEY,
    access_token: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
})

const app = express();

const PORT = process.env.PORT || 8080
const owner = process.env.OWNER
const repo = process.env.REPO

const baseUrl = 'https://api.github.com'

app.get('/repocontent', async (req, res) => {
    const result = await axios.get(`${baseUrl}/repos/${owner}/${repo}/contents/log.md`);
    console.log(result)
    res.json(result.data)
})

app.get('/filecontent', async (req, res) => {
    const result = await axios.get(`https://raw.githubusercontent.com/${owner}/${repo}/master/log.md`)
    console.log(result)
    let dataString = result.data
    const regex = /\*/g;
    const regex2 = /\r\n/g;
    dataString = dataString.replace(regex, '').replace(regex2, '')

    const logEntries = dataString.trim().split('###')
    res.json(logEntries)
})

app.get('/commits', async (req, res) => {
    const result = await axios.get(`${baseUrl}/repos/${owner}/${repo}/commits`)
    console.log(result)
    res.json(result.data)
})

async function commmitListener() {

    const loggedMsg = await fs.readFile('log.txt', 'utf8');
    const result = await axios.get(`${baseUrl}/repos/${owner}/${repo}/commits`)
    const dataSet = result.data;
    
    const msgArr = dataSet.map(e => e.commit.message)
    const lastMsg = msgArr[0].trim()
    console.log(lastMsg)
    if (lastMsg !== loggedMsg) {
        await fs.unlink('log.txt')
        await fs.appendFile('log.txt', lastMsg)
        
        const rawContents = await axios.get(`https://raw.githubusercontent.com/${owner}/${repo}/master/log.md`)

        const regex = /\*/g;
        dailyEntries = rawContents.data.replace(regex, '').split('###')
        dailyEntries.splice(0,1)

        const ent = dailyEntries[dailyEntries.length - 1]

        const startTerm = `Today's Progress:`
        const endTerm = `Thoughts:`
        const startIndex = ent.indexOf(startTerm) + startTerm.length
        const endIndex = ent.indexOf(endTerm)

        let progressText = lastMsg + '\n' + ent.slice(startIndex, endIndex).trim()
        if (progressText.length > 280) {
            progressText = progressText.slice(0, 276) + '...'
        }
        await fs.unlink('content.txt')
        await fs.appendFile('content.txt', progressText)    
        
        T.post('statuses/update', { status:  progressText}, function(err, data, response) {
            console.log(data)
            res.status(200).json('all good')
          })
    }
}

app.listen(PORT, () => {
    console.log(`\n⚡ server is running on port:${PORT} ⚡️\n`);
    setInterval(() => commmitListener(), 10000)
});