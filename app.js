const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
const fs = require('fs')
const db = require('./db')


const sleep = (ms) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, ms + Math.round(Math.random() * 5000));
    })
}

const scraper = (data_list) => {
    return new Promise(async (resolve, reject) => {
        var path = __dirname + '\\vpn'
        const browser = await puppeteer.launch({
            headless: false,
            executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            args: [
                
                '--window-size=1920,1080',
            ]
        });

        try {
           
            const page = await browser.newPage();
            await page.setRequestInterception(true);
            page.on('request', request => {
                if (request.resourceType() === 'image') {
                    request.abort();
                } else {
                    request.continue();
                }
            });
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
            await page.setViewport({ width: 1920, height: 1080 });
            await page.goto('https://www.amazon.com/', { waitUntil: 'networkidle2' })
            await page.click('#twotabsearchtextbox')
            await sleep(1000)
            await page.keyboard.type(data_list.keyword)
            await sleep(1000)
            await page.keyboard.press('Enter');
            await Promise.all([
                page.keyboard.press('Enter'),
                page.waitForNavigation({ waitUntil: 'networkidle2' })
            ])
            var all_list = []
            var while_status = await page.evaluate(() => {
                return document.querySelector('.s-pagination-next') && document.querySelector('.s-pagination-next').classList.contains('s-pagination-disabled')
            });
            while (!while_status) {
                const data = await page.evaluate(async () => {

                    const sleep = (ms) => {
                        return new Promise((resolve, reject) => {
                            setTimeout(() => {
                                resolve()
                            }, ms + Math.round(Math.random() * 5000));
                        })
                    }
                    while (document.querySelectorAll('h2').length <= 0 || !document.querySelector('.s-pagination-next')) {
                        await sleep(1000)
                    }

                    var d_list = []
                    document.querySelectorAll('h2').forEach(el => {
                        try {
                            var asin = ''
                            if (el.querySelector('a')) {
                                asin = String(el.querySelector('a').href).split('/dp/')[1].split('/')[0]
                            }

                            d_list.push({
                                name: el.textContent,
                                link: el.querySelector('a') ? el.querySelector('a').href : false,
                                asin: asin
                            })
                        } catch (err) { }
                    });
                    console.log(d_list.length);
                    return d_list
                });
                await sleep(5000)
                data.map(l => all_list.push(l))
                try {
                    await Promise.all([
                        page.waitForSelector('.s-pagination-next'),
                        page.click('.s-pagination-next'),
                        page.waitForNavigation({ waitUntil: 'networkidle2' })
                    ])
                } catch (err) { }

                while_status = await page.evaluate(() => {
                    return document.querySelector('.s-pagination-next') && document.querySelector('.s-pagination-next').classList.contains('s-pagination-disabled')
                });
                fs.writeFileSync('./data.json', JSON.stringify(all_list))
            }
            var clear_list = []
            all_list.forEach(el => {
                var status = false

                clear_list.forEach(es => {
                    if (el.asin == es.asin) {
                        status = true
                    }
                });
                if (el.asin.length <= 0) {
                    status = true
                }
                if (status == false) {
                    clear_list.push(el)
                }

            });


            fs.writeFileSync('./data.json', JSON.stringify(all_list))
            fs.writeFileSync('./clear.json', JSON.stringify(clear_list))
            console.log(all_list.length);
            console.log(clear_list.length);
            for (var item of clear_list) {
                await db.add(item)
            }
            await browser.close()
            resolve(all_list)



        } catch (err) {
            console.log(err);
            await browser.close()
            var data = await scraper(data_list)
            resolve(data)
        }

    })
}


scraper({
    keyword: 'rtx'
})