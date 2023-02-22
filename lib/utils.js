import fs from 'fs';
import { client } from './discord.js';
import { page } from './puppeteer.js';
import Jimp from "jimp";
import { createClient } from '@supabase/supabase-js'


const channelImgId = '1069953787235684382';
const channelTxt2txtId = '1069981994714415135';
const channelImg2txtId = '1069981948778385428';
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}
const writeFileAsync = (dir, name, buffer, i) => {
    return new Promise(resolve => {
        fs.writeFileSync(`${dir}/` + `${name}_${i+1}.png`, buffer);
        resolve();
        console.log('🚀 ~~~~~~~~~~~~ writeFileAsync ~~~~~~~~~~~~done', i);
    });
}
const screenBrowser = async () => {
    let filename = `${(new Date().toJSON().slice(0,19).replace(/:/g, '-'))}.png`
    await page.screenshot({path: `./img/screens/${filename}`, captureBeyondViewport: false });
}
const sendImgToJourney = async (url, ref) => {
    console.log(`🚀 ~~~~~~~ sendImgToJourney ~~~~~~~ Triggred`);
    try {
        await page.click('li[data-dnd-name="img2txt"]');
        await page.evaluate( () => document.querySelector('[role="textbox"]').value = "");
        await page.type('[role="textbox"]', '/imagine',  {delay: 100});
        // await page.type('[role="textbox"]', ' ', {delay: 1000});
        // await page.click('#autocomplete-0', {delay: 100});
        await page.keyboard.press('Enter', {delay: 100});
        await page.type('[role="textbox"]', url,  {delay: 10});
        await page.type('[role="textbox"]', ' ',  {delay: 100});
        await page.type('[role="textbox"]', `ultradetailled ultrarealistic 3D cartoon --no glasses, ${ref}`);
        await page.keyboard.press('Enter', {delay: 100});
    } catch (error) {
        console.log(`🚀 ~~~~~~~ sendImgToJourney ~~~~~~~ error`, error);
        await screenBrowser();
    }
}
const uploadImgToDiscord = async (ref, buffer) => {
    try {
        const channel = client.channels.cache.get(channelImgId);
        channel.send({ content: ref, files: [{ attachment: buffer , name: `${ref}.png` }]});
    } catch (error) {
        console.log(`🚀 ~~~~~~~ uploadImgToDiscord ~~~~~~~ error`, error);
        await screenBrowser();
    }
}
// const write = async (blurred, i, x, name, project, ref) => {
//      const buffer = await sharp(blurred).toBuffer();
//     const dir = `./img/${project}/${ref}`;
//     if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
//     fs.writeFileSync(`${dir}/` + `${name}_${x}_${i}.jpg`, buffer);
// }
const readAndSplit = async (imgUrl, name, message, project, ref) => {
    const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE;
    console.log('🚀 ~~~~~~~~~~~~ readAndSplit ~~~~~~~~~~~~ supabaseKey:', supabaseKey);
    console.log('🚀 ~~~~~~~~~~~~ readAndSplit ~~~~~~~~~~~~ supabaseUrl:', supabaseUrl);
    const getServiceSupabase = () => createClient(
        supabaseUrl,
        supabaseKey
    );
    const supabase = getServiceSupabase();

    const image = await Jimp.read({
        url: imgUrl, // Required!
    });
    const dir = `./img/${project}/${ref}`;
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    // this is just a placeholder
    const size = image.getWidth() / 2;
    const coords = [
        {x: 0, y: 0},
        {x: size, y: 0},
        {x: 0, y: size},
        {x: size, y: size}
    ]
    const avatarArray = [];
    coords.forEach(async (coord, i) => {
        try {
            const pic = image.clone();
            const buffer = await pic
                .crop(coord.x, coord.y, size, size)
                .resize(256, 256)
                .getBufferAsync(Jimp.MIME_JPEG);
            fs.writeFileSync(`${dir}/` + `${name}_${i+1}.png`, buffer);
            avatarArray.push({
                url: `https://tranquil-anchorage-36819.herokuapp.com/${project}/${ref}/${name}_${i+1}.png`
            })
        } catch (error) {
            console.log(`🚀 ~~~~~~~~~~~~ readAndSplit ~~~~~~~~~~~~ error ${i} ~~~~~~~~~~~~`, error);
        }
    });
    const promises = [
        supabase.from('avatar').insert(avatarArray),
        supabase.from('job').upsert({
            id: ref,
            status: 'done',
        }),
    ]
    await Promise.all(promises);
}


export { readAndSplit, uploadImgToDiscord, sendImgToJourney, screenBrowser, sleep }