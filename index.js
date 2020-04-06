// Ref. https://www.youtube.com/watch?v=oaJq1mQ3dFI
const express = require('express');
const fetch = require('node-fetch');
const redis = require('redis');


const PORT = process.env.PORT || 5000;
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';

const client = redis.createClient(REDIS_PORT, REDIS_HOST);

const app = express();

// Set response
function setResponse(username, repos) {
    return `<h2>${username} has ${repos} Github repos</h2>`;
  }

// Make request to Github for data
const getRepos = async (req, res, next) => {
    try {
        console.log('Fetching Data...');

        const  { username } = req.params;

        

        const response = await fetch(`https://api.github.com/users/${username}`);

        const data = await response.json();

        const repos = JSON.stringify(data);

        // Set data to Redis

        client.setex(username, 3600, repos);

        res.json(data);

    } catch (error) {
        console.log(error);
        res.status(500);
    }
}

// Cache Middleware
const chche = (req, res, next) => {
    const { username } = req.params;

    client.get(username, (err, data) => {
        if (err) throw err;

        if (data !== null) {
            res.send(JSON.parse(data));
        } else {
            next();
        }
    })
}


app.get('/repos/:username', chche, getRepos);


app.listen(PORT, () => {
    console.log('app running PORT: ' + PORT);
})


