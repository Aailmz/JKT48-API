const express = require('express');
const bodyParser = require('body-parser');
const bot = require('./bot');
const cron = require('node-cron');

const app = express();
const port = 8000;

app.use(bodyParser.json());

let theaterScheduleData = []; // Variable for theater schedule data
let setlistData = []; // Variable for setlist data

const performScraping = async () => {
    try {
        const url = "https://www.jkt48showroom.com/theater-schedule"; // URL for theater schedules
        await bot.init();

        // Scrape theater schedule data
        theaterScheduleData = await bot.scrape(url);
        
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

app.post('/welcome', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Welcome</title>
            </head>
            <body>
                <h1>Welcome to the Theater Schedule Scraper!</h1>
                <p>Use the following endpoints:</p>
                <ul>
                    <li><strong>/theater-schedule</strong> - Shows all theater schedules.</li>
                    <li><strong>/setlist</strong> - Shows the setlist data.</li>
                </ul>
            </body>
        </html>
    `);
});

app.get('/theater-schedule', (req, res) => {
    res.json(theaterScheduleData); // Return scraped theater schedule data
});

app.get('/setlist', (req, res) => {
    res.json(setlistData); // Return scraped setlist data
});

cron.schedule('0 * * * *', () => {
    console.log('Running scheduled scraping');
    performScraping();
});

performScraping();
