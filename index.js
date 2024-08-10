const express = require('express');
const bodyParser = require('body-parser');
const bot = require('./bot');
const cron = require('node-cron');

const app = express();
const port = 8000;

app.use(bodyParser.json());

let scrapedData = [];
let setlistData = []; // New variable for setlist data

const performScraping = async () => {
    try {
        const url = "https://www.jkt48showroom.com/theater-schedule";
        await bot.init();
        
        // Scrape main data
        scrapedData = await bot.scrape(url);
        
        // Scrape additional setlist data
        setlistData = await bot.scrapeSetlist(); // Call new function for setlist scraping
        
        await bot.close();
        console.log('Scraping successful');
        startServer(); 
    } catch (e) {
        console.log('Scraping failed', e);
    }
};

const startServer = () => {
    app.listen(port, () => {
        console.log(`Server is running on http://192.168.100.41:${port}/`);
    });
};

app.post('/', async (req, res) => {
    await performScraping();
    res.json({ message: 'Hi there!' });
});

app.get('/data', (req, res) => {
    res.json(scrapedData); // Return main scraped data
});

// New endpoint for setlist data
app.get('/setlist', (req, res) => {
    res.json(setlistData); // Return setlist data
});

cron.schedule('0 * * * *', () => {
    console.log('Running scheduled scraping');
    performScraping();
});

performScraping();
