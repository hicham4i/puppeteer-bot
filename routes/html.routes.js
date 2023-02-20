import express from 'express';
import { page } from '../lib/puppeteer.js';

const router = express.Router();

router.get('/', async (req,res) => {
    const html = await page.content();
    res.send(html)                 
});
export default router
