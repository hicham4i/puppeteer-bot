import puppeteer from 'puppeteer-extra';
import randomUseragent from 'random-useragent';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha';
import fs from 'fs';
const RECAPTCHATOKEN = process.env.RECAPTCHATOKEN || '';

puppeteer.use(
    RecaptchaPlugin({
      provider: {
        id: '2captcha',
        token: RECAPTCHATOKEN // REPLACE THIS WITH YOUR OWN 2CAPTCHA API KEY ⚡
      },
      visualFeedback: true // colorize reCAPTCHAs (violet = detected, green = solved)
    })
)

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36';
const userAgent = randomUseragent.getRandom((ua) => {
  return ua.deviceType !== 'mobile';
});;
const UA = userAgent || USER_AGENT;

const browser = await puppeteer.launch({ignoreHTTPSErrors: true,
headless: true,
args: [
    `--window-size=1920,1080`,
    "--window-position=000,000",
    "--disable-dev-shm-usage",
    "--no-sandbox",
    "--disable-web-security",
    '--disable-setuid-sandbox',
    '--disable-features=IsolateOrigins,site-per-process,SitePerProcess',
    '--flag-switches-begin --disable-site-isolation-trials --flag-switches-end',
    '--start-maximized'
],
defaultViewport: {
  width:1920,
  height:1080
}});
// const cookiesfile = fs.readFileSync('./cookies.json');
// const cookies = JSON.parse(cookiesfile);
const pages = await browser.pages();
const page = pages[0];
await page.deleteCookie();
// page.setCookie(...cookies);
await page.setUserAgent(UA);
await page.setJavaScriptEnabled(true);

export { page }