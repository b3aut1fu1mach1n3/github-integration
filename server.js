const axios = require('axios')
const Twit = require('twit')
const fs = require('fs').promises

require('dotenv').config()

const T = new Twit({
    consumer_key: process.env.API_KEY,
    consumer_secret: process.env.API_SECRET_KEY,
    access_token: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
})

const owner = process.env.OWNER
const repo = process.env.REPO
const baseUrl = 'https://api.github.com'

async function commmitListener() {
    let lastMsg, loggedMsg;

    try {
        
        let result = await axios.get(`${baseUrl}/repos/${owner}/${repo}/commits`);
        let dataSet = result.data;
        let msgArr = dataSet.map(e => e.commit.message);
        
        loggedMsg = await fs.readFile('log.txt', 'utf8');
        lastMsg = msgArr[0].trim();

    } catch (error) {

        console.log(error);

    }
    console.log(Date.now())
    console.log('Last Message on Repo', lastMsg)
    console.log('Last Message on File', loggedMsg)

    if (lastMsg !== loggedMsg  && lastMsg.indexOf('#100DaysOfCode') !== -1) {
        
        try {
            
            const regex = /\*/g;
            let rawContents = await axios.get(`https://raw.githubusercontent.com/${owner}/${repo}/master/log.md`)

            dailyEntries = rawContents.data.replace(regex, '').split('###')
            dailyEntries.splice(0, 1)
            
            const latestEntry = dailyEntries[dailyEntries.length - 1]
            
            const startTerm = `Today's Progress:`
            const endTerm = `Thoughts:`

            const startIndex = latestEntry.indexOf(startTerm) + startTerm.length
            const endIndex = latestEntry.indexOf(endTerm)
            
            let progressText = lastMsg + '\n\n' + latestEntry.slice(startIndex, endIndex).trim()
            
            if (progressText.length > 280) {
                progressText = progressText.slice(0, 275) + '...'
            }
            
            await fs.unlink('log.txt')
            await fs.appendFile('log.txt', lastMsg)
            await fs.unlink('content.txt')
            await fs.appendFile('content.txt', progressText)
            
            T.post('statuses/update', { status: progressText }, function (err, data, response) {
                if (err) throw err
                console.log(data)
            })

        } catch (error) {
            console.log(error)   
        }
    }
}

commmitListener();
setInterval(() => commmitListener(), 350 * 1000)
