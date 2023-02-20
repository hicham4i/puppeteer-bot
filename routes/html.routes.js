import express from 'express';
import { page } from '../lib/puppeteer.js';
import { screenBrowser } from '../lib/utils.js';

const router = express.Router();

router.get('/', async (req,res) => {
    const html = await page.content();
    await screenBrowser();
    res.send(html);               
});
export default router
