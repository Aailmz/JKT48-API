const bot = require('./bot');

(async () => {
    await bot.init();
    const url = "https://www.jkt48showroom.com/theater-schedule";
    const data = await bot.scrape(url);
    console.log(data);
    await bot.close();
})();
