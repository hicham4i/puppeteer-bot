// To use .env file for securely sharing secret key or other authentication secrets
import dotenv from 'dotenv';
import fs from 'fs';

import express, { urlencoded, json } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';

// custom module imports
import userRoutes from './routes/user.routes.js';
import pictureRoutes from './routes/pictures.routes.js';
import txt2imgRoutes from './routes/txt2img.routes.js';
import img2imgRoutes from './routes/img2img.routes.js';
import { page } from './lib/puppeteer.js';
import {  sleep } from './lib/utils.js';

dotenv.config()
console.log('🚀 ~~~~~~~~~~~~ server js runing ~~~~~~~~~~~~');

// create express instance
const app = express()

// set the port for devlopment and for heroku
const PORT = process.env.PORT || 4001;
const DISCORD_USER = process.env.DISCORD_USER;
console.log(`🚀 ~~~~~~~ DISCORD_USER`, DISCORD_USER);
const DISCORD_PWD = process.env.DISCORD_PWD;
console.log(`🚀 ~~~~~~~ DISCORD_PWD`, DISCORD_PWD);
await page.goto('https://discord.com/login?redirect_to=%2Fchannels%2F1068479267018641468%2F1068479267480027186', {
    // waitUntil: "load",
    // timeout: 0
    waitUntil: "networkidle0",
});
await sleep(2000);
await page.type('#uid_8', DISCORD_USER);
await page.type('#uid_11', DISCORD_PWD?.trim());
await sleep(2000);
await page.click('button[type="submit"] > div', {delay: 10});
await sleep(2000);
let filename = `${(new Date().toJSON().slice(0,19).replace(/:/g, '-'))}.png`
await page.screenshot({path: `./img/screens/${filename}`, captureBeyondViewport: false });

// Use Express's in-built middleware to parse json and form functionality
app.use(urlencoded({extended:true}))
app.use(json())

// Use Helmet for cross-site attack protection
app.use(helmet())

// use morgan for logging functionality
app.use(morgan('dev'))

// use cors for cross origin accessing
app.use(cors())
app.use(express.static('img'));

// routes fo post and user
app.use('/user', userRoutes)
app.use('/picture', pictureRoutes)
app.use('/text2img', txt2imgRoutes)
app.use('/img2img', img2imgRoutes)


app.get('/',(req,res) => {
    res.send('Main URL Accessed')
})

// listen to port
app.listen(PORT, async () => {
    console.log(`Server is running at port ${PORT}`);
    let close = false;
    const intv = setInterval( async() => {
        let filename = `${(new Date().toJSON().slice(0,19).replace(/:/g, '-'))}.png`
        await page.screenshot({path: `./img/screens/${filename}`, captureBeyondViewport: false });
        if (close) clearInterval(intv)
    }, 10000);
    await sleep(20000);
    const {
        solved,
        error
    } = await page.solveRecaptchas();
    
    if (solved) {
        console.log('✔  the captcha is solved')
    } else {
        console.log('x  the captcha is not solved', error)
    }
    close = true;
})
export default app