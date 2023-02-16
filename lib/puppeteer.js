import puppeteer from 'puppeteer-extra';
import randomUseragent from 'random-useragent';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
// const { hcaptcha } = require("puppeteer-hcaptcha");
import fs from 'fs';

puppeteer.use(StealthPlugin())

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36';
const userAgent = randomUseragent.getRandom();
const UA = userAgent || USER_AGENT;

const browser = await puppeteer.launch({headless: false,
args: [
    `--window-size=1200,1000`,
    "--window-position=000,000",
    "--disable-dev-shm-usage",
    "--no-sandbox",
    '--user-data-dir="/tmp/chromium"',
    "--disable-web-security",
    "--disable-features=site-per-process",
    '--disable-setuid-sandbox'
]});
const cookiesfile = fs.readFileSync('./cookies.json');
const cookies = JSON.parse(cookiesfile);
console.log('🚀 ~~~~~~~~~~~~ cookies', cookies);
const pages = await browser.pages();
const page = pages[0];
page.setCookie(...cookies);
// await page.setUserAgent(UA);
// await page.setJavaScriptEnabled(true);

export { page }