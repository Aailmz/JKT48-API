const express = require('express');
const bodyParser = require('body-parser');
const bot = require('./bot');
const cron = require('node-cron');

const app = express();
const port = 8000;

app.use(bodyParser.json());

let scrapedData = [];

// Fungsi untuk melakukan scraping dan menyimpan data di server
const performScraping = async () => {
    try {
        const url = "https://www.jkt48showroom.com/theater-schedule";
        await bot.init();
        const data = await bot.scrape(url);
        await bot.close();
        scrapedData = data;
        console.log('Scraping successful', data);
    } catch (e) {
        console.log('Scraping failed', e);
    }
};

// Endpoint untuk memulai scraping secara manual
app.post('/scrape', async (req, res) => {
    await performScraping();
    res.json({ message: 'Scraping triggered' });
});

// Endpoint untuk mengambil data hasil scraping
app.get('/data', (req, res) => {
    res.json(scrapedData);
});

// Menjalankan scraping otomatis setiap jam (atur sesuai kebutuhan)
cron.schedule('0 * * * *', () => {
    console.log('Running scheduled scraping');
    performScraping();
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}/data`);
    performScraping(); // Jalankan scraping saat server dimulai
});
