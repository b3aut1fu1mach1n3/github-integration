const express = require('express')
const axios = require('axios')

require('dotenv').config()

const app = express();
const PORT = process.env.PORT || 8080

const baseUrl = 'https://api.github.com'

app.get('/repocontent', async (req, res) => {
    const result = await axios.get(`${baseUrl}/repos/b3aut1fu1mach1n3/image-upload/contents/README.md`);
    console.log(result)
    res.json(result.data)
})

app.get('/filecontent', async (req, res) => {
    const result = await axios.get('https://raw.githubusercontent.com/b3aut1fu1mach1n3/image-upload/main/README.md')
    console.log(result)
    res.json(result.data)
})

app.listen(PORT, () => {
    console.log(`\n⚡ server is running on port:${PORT} ⚡️\n`);
});