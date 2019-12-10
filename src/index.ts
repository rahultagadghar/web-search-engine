const puppeteer = require('puppeteer');
const visited = [];
const content = [];
const startSpider = async (url = [], depthLevel = 1) => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    let length = url.length

    while (length) {
        await bruteForce(url[--length], 0)
    }
    console.log('content', content)
    async function bruteForce(url, levels) {
        if (!url || levels === depthLevel) {
            return
        }

        console.log('BruteForce', url, levels)

        const isVisited = visited.find(o => o === url)

        if (isVisited) {
            return
        }

        visited.push(url)

        await page.goto(url);

        const bodyAsText = await page.evaluate(() => document.body.textContent.replace(/\n|\r/g, "").trim())

        const allUrlsFromWebpage = await page.evaluate(() => [...document.links].map(o => o.href));

        content.push({ url, body: bodyAsText })

        let l = allUrlsFromWebpage.length

        while (l) {
            await bruteForce(allUrlsFromWebpage[--l], levels + 1)
        }

        return

    }

}

const listOfUrls = ["http://example.com", "http://imrahul.herokuapp.com/"];

startSpider(listOfUrls, 1)