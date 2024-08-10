const puppeteer = require('puppeteer');

const bot = {
    browser: null,
    page: null,

    init: async () => {
        bot.browser = await puppeteer.launch({ headless: true });
        bot.page = await bot.browser.newPage();
    },

    scrape: async (urlWeb) => {
        await bot.page.goto(urlWeb, { waitUntil: 'networkidle2' });
        const targets = await bot.page.$$("div.mb-4.col-sm-12.col-md-4");
        const results = [];

        for (const target of targets) {
            try {
                const url = await target.$eval('a', el => el.getAttribute('href'));
                const scheduleUrl = 'https://www.jkt48showroom.com/' + url;
                console.log(scheduleUrl);

                const data = await bot.scrapeSchedule(scheduleUrl);
                results.push({ scheduleUrl, ...data });
            } catch (e) {
                console.log(e);
            }
        }

        return results;
    },

    scrapeSchedule: async (url) => {
        const newPage = await bot.browser.newPage();
        await newPage.goto(url, { waitUntil: 'networkidle2' });

        try {
            const title = await newPage.$eval('div.theater-container div.setlist-container div.menu-setlist.mt-1 div.mt-1 span', el => el.innerText);
            
            const infoElements = await newPage.$$eval('div.theater-container div.theater-info div.info-container div.menu-setlist.mt-1 div.mt-1 p', elements => {
                return elements.map(el => el.innerText);
            });
            const date = infoElements[0] || ''; 
            const time = infoElements[1] || '';

            await newPage.close();
            return { title, date, time };
        } catch (e) {
            console.log(e);
            await newPage.close();
            return { error: e.message };
        }
    },

    // New method for scraping setlist data
    scrapeSetlist: async () => {
        const url = "https://www.jkt48showroom.com/some-other-setlist-url"; // Update this URL
        const newPage = await bot.browser.newPage();
        await newPage.goto(url, { waitUntil: 'networkidle2' });

        try {
            const setlistItems = await newPage.$$eval('div.setlist-item-selector', elements => { // Update this selector
                return elements.map(el => el.innerText);
            });

            await newPage.close();
            return setlistItems; // Return the scraped setlist data
        } catch (e) {
            console.log(e);
            await newPage.close();
            return { error: e.message };
        }
    },

    close: async () => {
        if (bot.browser) {
            await bot.browser.close();
        }
    }
};

module.exports = bot;
