import { operations } from "./elastic";
import { URL } from 'url'
import axios from 'axios';
const robotsParser = require('robots-parser');

const puppeteer = require('puppeteer');
const visited = [];
const content = [];
const state = {
    yetToVisit: [],
    presentHost: null,
    robots: null
}
const startSpider = async (url = [], depthLevel = 1) => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    let length = url.length

    function removeWWW(endPoint) {
        return endPoint.replace(/www./, '')
    }

    async function getRobotTxt(endPoint) {
        try {
            const result = await axios.get(endPoint + "/robots.txt")
            if (result.status !== 200 || !result.data.length) {
                return false
            }
            return result.data;
        } catch (error) {
            console.log("getRobotTxt -> error", error)
            return false
        }
    }
    function checkForSameOrigin(endPoint) {
        try {
            const host = new URL(state.presentHost)
            const targetHost = new URL(endPoint)
            return host.hostname === targetHost.hostname
        } catch (error) {
            console.log("checkForSameOrigin -> error", error)
            return false
        }
    }
    function getOrigin(url) {
        try {
            const { origin } = new URL(url)
            return removeWWW(origin)
        } catch (error) {
            console.log("getOrigin -> error", error)
            return false
        }
    }

    function canVisit(endPoint) {
        try {
            return state.robots.isAllowed(endPoint, 'Sams-Bot/1.0')
        } catch (error) {
            console.log("canVisit -> error", error)
            return false
        }
    }

    function wait(seconds) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve()
            }, 1000 * seconds)
        })
    }

    while (length) {
        let crawlEndPoint = getOrigin(url[--length]);
        if (!crawlEndPoint) {
            continue
        }
        state.presentHost = crawlEndPoint;
        const robotsTxt = await getRobotTxt(crawlEndPoint)
        if (!robotsTxt) {
            continue
        }
        state.robots = robotsParser(crawlEndPoint + '/robots.txt', robotsTxt)

        if (!state.robots._rules["*"]) {
            continue
        }

        await bruteForce(crawlEndPoint, 0)
    }
    async function bruteForce(url, levels) {
        if (!url || levels === depthLevel) {
            return
        }

        const sameHost = checkForSameOrigin(url)
        console.log("bruteForce -> sameHost", sameHost)

        if (!sameHost) {
            state.yetToVisit.push(getOrigin(url))
            return
        }

        const visit = canVisit(url);
        console.log("bruteForce -> visit", visit, url, levels)

        if (!visit) {
            return
        }

        const href = new URL(url).href;

        const isVisited = visited.find(o => o === href)

        if (isVisited) {
            return
        }

        visited.push(href)

        await page.goto(url, { waitUntil: 'domcontentloaded' });

        const bodyAsText = await page.evaluate(() => document.body.textContent.replace(/\n|\r/g, "").trim())

        let allUrlsFromWebpage = await page.evaluate(() => eval(`[...document.links].map(o => o.href)`));

        allUrlsFromWebpage = allUrlsFromWebpage.map(o => removeWWW(o));

        await operations(<any>{ url, body: bodyAsText })
        content.push({ url, body: bodyAsText })

        let l = allUrlsFromWebpage.length


        while (l) {
            const secondsToWait = state.robots.getCrawlDelay('Sams-Bot/1.0');

            if (secondsToWait) {
                await wait(secondsToWait)
            }

            await bruteForce(allUrlsFromWebpage[--l], levels + 1)
        }

        return

    }

}

// const listOfUrls = [];
// const listOfUrls = ["http://example.com", "https://www.covid19india.org/", "http://imrahul.herokuapp.com/"];
// const listOfUrls = ["https://nodejs.org/"];
const listOfUrls = ["https://forbes.com/"];

startSpider(listOfUrls, 5).then(() => console.log("crawling completed"))