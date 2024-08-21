const express = require('express');
const bodyParser = require('body-parser');
const bot = require('./bot');
const cron = require('node-cron');

const app = express();
const port = 8000;

app.use(bodyParser.json());

let theaterScheduleData = { scheduleURLs: [], membersURLs: [] };  // Object to store scraped data

const performScraping = async () => {
  try {
    const theaterUrl = "https://www.jkt48showroom.com/";
    await bot.init();

    // Scrape data from both selectors
    theaterScheduleData = await bot.scrape(theaterUrl);
    console.log('Scraping successful');

    await bot.close();
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
  res.send(
    `<!DOCTYPE html>
      <html>
        <head>
          <title>Welcome</title>
        </head>
        <body>
          <h1>Hi Fellas!</h1>
          <p>For now, you can use this following endpoints:</p>
          <ul>
            <li><strong>/theater-schedule</strong> - Shows current JKT48 Theater Schedules.</li>
            <li><strong>/second-scraped-data</strong> - Shows data scraped from the second URL (if available).</li>
          </ul>
        </body>
      </html>`
  );
});

app.get('/theater-schedule', (req, res) => {
  res.json({
    scheduleData: theaterScheduleData.scheduleURLs.map(data => ({ ...data, scrapedUrl: data.scheduleUrl })),
    membersData: theaterScheduleData.membersURLs.map(data => ({ ...data, scrapedUrl: data.membersUrl }))
  });
});

app.get('/second-scraped-data', (req, res) => {
  // Check if there's data for the second URL
  if (theaterScheduleData.membersURLs.length > 0) {
    res.json(theaterScheduleData.membersURLs); // Assuming the members URLs contain the second URL's data
  } else {
    res.json({ message: 'No data available for the second URL yet.' });
  }
});

performScraping().then(startServer);

cron.schedule('0 * * * *', async () => {
  console.log('Running scheduled scraping');
  await performScraping();
});
