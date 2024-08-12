const express = require('express');
const bodyParser = require('body-parser');
const bot = require('./bot');
const cron = require('node-cron');

const app = express();
const port = 8000;

app.use(bodyParser.json());

let theaterScheduleData = []; 

const performScraping = async () => {
    try {
        const theaterUrl = "https://www.jkt48showroom.com/theater-schedule"; 
        await bot.init();

        theaterScheduleData = await bot.scrape(theaterUrl);
        
        await bot.close();
        console.log('Scraping successful');
        startServer();
    } catch (e) {
        console.log('Scraping failed', e);
    }
};

const startServer = () => {
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}/welcome`);
    });
};

app.get('/welcome', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Welcome</title>
            </head>
            <body>
                <h1>Hi Fellas!</h1>
                <p>For now, you can use this following endpoints:</p>
                <ul>
                    <li><strong>/theater-schedule</strong> - Shows current JKT48 Theater Schedules.</li>
                </ul>
            </body>
        </html>
    `);
});

app.get('/theater-schedule', (req, res) => {
    res.json(theaterScheduleData); 
});

cron.schedule('0 * * * *', () => {
    console.log('Running scheduled scraping');
    performScraping();
});

performScraping();
