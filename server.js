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
import {  readAndSplit, screenBrowser, sendImgToJourney, sleep } from './lib/utils.js';
import { client } from './lib/discord.js';

dotenv.config()
console.log(`✅ Server is getting started ✅`);

// create express instance
const app = express()

// set the port for devlopment and for heroku
const PORT = process.env.PORT || 4001;
const token = process.env.DISCORD_TOKEN;
const DISCORD_USER = process.env.DISCORD_USER;
const DISCORD_PWD = process.env.DISCORD_PWD;

await page.goto('https://discord.com/login?redirect_to=%2Fchannels%2F1068479267018641468%2F1068479267480027186', {
    // waitUntil: "load",
    // timeout: 0
    waitUntil: "networkidle0",
});
await sleep(1000);
await page.waitForSelector('#uid_8');
await page.type('#uid_8', DISCORD_USER);
await page.type('#uid_11', DISCORD_PWD?.trim());
await sleep(1000);
await page.click('button[type="submit"] > div', {delay: 10});
await sleep(3000);
await screenBrowser();
const {
    solved,
    error
} = await page.solveRecaptchas();
if (solved) {
    console.log('✔  the captcha is solved')
} else {
    console.log('x  the captcha is not solved', error)
}
await sleep(3000);
await screenBrowser();
await page.waitForSelector('#uid_8');
await page.click('button[type="submit"] > div', {delay: 10});
await sleep(4000);
await screenBrowser();
client.on("ready", async () => {
    console.log("✅ The AI bot is online ✅"); 
});

client.on("messageCreate", async (message) => {
    try {
        if (message.author.id === '936929561302675456' && message.attachments && message.attachments.first() && message.attachments.first().contentType === 'image/png') {
            const attachement = message.attachments.first();
            const ref = message.content.split(',')[1].split('**')[0].trim();
            readAndSplit(attachement.url, 
                attachement.name.split('.')[0],
                message, 
                message.channelId === '1069981948778385428' ? 'furrytag': message.channelId === '1069981994714415135' ? 'artibar' : 'random',
                ref
            );
            return;
        }
        
        if ( message.channelId === '1069953787235684382' && message.author.id === '1068456688132292648') {
            const attachement = message.attachments.first();
            sendImgToJourney(attachement.url, message.content);
            return;
        }
    } catch (error) {
        console.log(`🚀 ~~~~~~~ client.on ~~~~~~~ error`, error);
    }
});
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
    console.log(`✅ Server is running at port ${PORT} ✅`);
    client.login(token);
    await screenBrowser();
    // await readAndSplit('https://media.discordapp.net/attachments/1068479267480027186/1070744623598800976/SEO_ultradetailled_ultrarealistic_3D_cartoon_30246e37-0728-466e-ae63-8c9d48e18fc8.png',
    // 'azerty',
    // '',
    // 'furrytag',
    // 'test')
})
export default app