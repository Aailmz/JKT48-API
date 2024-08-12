const bot = require('./bot');

(async () => {
    await bot.init();

    const theaterUrl = "https://www.jkt48showroom.com/theater-schedule";
    const theaterData = await bot.scrape(theaterUrl);
    console.log('Theater Schedule Data:', theaterData);

    await bot.close();
})();
