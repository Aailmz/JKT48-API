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

    const selectors = [
      "div.react-reveal div.react-reveal div.row div.mb-4.col-sm-12.col-md-4 a", // Schedule URLs
      "div.react-reveal div div.container-grid div.item.column-12.row-1 div.react-reveal.card.card-featured a" // Members URLs
    ];

    const results = {
      scheduleURLs: [],
      membersURLs: []
    };
    const scrapedUrls = new Set();

    for (const selector of selectors) {
      const targets = await bot.page.$$(selector);
      for (const target of targets) {
        try {
          const url = await bot.page.evaluate(el => el.getAttribute('href'), target);
          const baseUrl = 'https://www.jkt48showroom.com';
          const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

          if (!scrapedUrls.has(fullUrl)) {
            scrapedUrls.add(fullUrl);

            if (selector === selectors[0]) {
              const data = await bot.scrapeSchedule(fullUrl);
              results.scheduleURLs.push({ scheduleUrl: fullUrl, ...data });
            } else {
              const secondPageData = await bot.scrapeSecondPage(fullUrl);
              results.membersURLs.push({ membersUrl: fullUrl, ...secondPageData });
            }
          }
        } catch (e) {
          console.log(e);
        }
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

      const lineUp = await newPage.$$eval('div.card-member-container div.member-detail div.btn-member div.member-name', elements => {
        return elements.map(el => el.innerText);
      });

      await newPage.close();
      return { title, date, time, lineUp };
    } catch (e) {
      console.log(e);
      await newPage.close();
      return { error: e.message };
    }
  },

  scrapeSecondPage: async (url) => {
    const newPage = await bot.browser.newPage();
    await newPage.goto(url, { waitUntil: 'networkidle2' });

    try {
      const data = await newPage.$$eval('div.layout div.row div.col-lg-8 div.row div.col div.mb-2.d-flex.justify-content-between h4', elements => {
        return elements.map(el => el.innerText);
      });

      await newPage.close();
      return { data }; // Assuming the data array holds the extracted content
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
