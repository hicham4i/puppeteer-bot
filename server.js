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
// import { page } from './lib/puppeteer.js';
import { readAndSplit, sleep } from './lib/utils.js';


dotenv.config()

// create express instance
const app = express()

// set the port for devlopment and for heroku
const PORT = process.env.PORT || 4001;
// await page.goto('https://discord.com/login?redirect_to=%2Fchannels%2F1068479267018641468%2F1068479267480027186', {
//     // waitUntil: "load",
//     // timeout: 0
//     waitUntil: "networkidle0",
// });
// await sleep(4000);
// let filename = `${(new Date().toJSON().slice(0,19).replace(/:/g, '-'))}.png`
// await page.screenshot({path: `./img/screens/${filename}`, captureBeyondViewport: false });

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
app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`);
})
export default app