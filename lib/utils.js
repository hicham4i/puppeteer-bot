import fs from 'fs';
import axios from 'axios';
// import * as tf from '@tensorflow/tfjs-node';
// import { client } from './discord.js';
import { page } from './puppeteer.js';
import sharp from 'sharp';


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
    await page.screenshot({path: `./img/screens/${filename}`,   });
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
        screenBrowser();
    }
}
const uploadImgToDiscord = async (ref, buffer) => {
    try {
        // const channel = client.channels.cache.get(channelImgId);
        // channel.send({ content: ref, files: [{ attachment: buffer , name: `${ref}.png` }]});
    } catch (error) {
        console.log(`🚀 ~~~~~~~ uploadImgToDiscord ~~~~~~~ error`, error);
        // screenBrowser();
    }
}
const write = async (blurred, i, x, name, project, ref) => {
     const buffer = await sharp(blurred).toBuffer();
    const dir = `./img/${project}/${ref}`;
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(`${dir}/` + `${name}_${x}_${i}.jpg`, buffer);
}
const readAndSplit = async (imgUrl, name, message, project, ref) => {
    const imageFromUrl = await axios.get(imgUrl, { responseType: 'arraybuffer' });
    const buff = Buffer.from(imageFromUrl.data, 'binary');
    const image = sharp(buff);
    const dir = `./img/${project}/${ref}`;
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    // this is just a placeholder
    const {width, height} = await image.metadata();

    const buffer_1 = await image
        .extract({ left: 0, top: 0, width: width / 2, height: height / 2 })
        .toBuffer();
    await writeFileAsync(dir, 'pics', buffer_1, 1)
    // console.log('🚀 ~~~~~~~~~~~~ readAndSplit ~~~~~~~~~~~~ buffer_1 done');
    const buffer_2 = await image
        .extract({ left: 512, top: 0, width: 512, height: 512 })
        .toBuffer();
    await writeFileAsync(dir, 'pics', buffer_2, 2)
    // fs.writeFileSync(dir + `_2.jpg`, buffer_2);
    console.log('🚀 ~~~~~~~~~~~~ readAndSplit ~~~~~~~~~~~~ buffer_2 done');
    const buffer_3 = await image
        .extract({ left: width / 2, top: 0, width: width / 2, height: height / 2 })
        .toBuffer();
    fs.writeFileSync(dir + `_3.jpg`, buffer_3);
    console.log('🚀 ~~~~~~~~~~~~ readAndSplit ~~~~~~~~~~~~ buffer_3 done');
    const buffer_4 = await image
        .extract({ left: width / 2, top: 0, width: width / 2, height: height / 2 })
        .toBuffer();
    fs.writeFileSync(dir + `_4.jpg`, buffer_4);
}
// const readAndSplit = async (imgUrl, name, message, project, ref) => {
//     const image = await axios.get(imgUrl, { responseType: 'arraybuffer' });
//     const b = Buffer.from(image.data).toString('base64');
//     const imgB = b.replace(
//         /^data:image\/(png|jpeg);base64,/,
//         ""
//     );
//     const buffer = Buffer.from(imgB, "base64");
//     const img = tf.node.decodeImage(buffer, 3);
//     message.channel.send("spliting and saving the imgs...");
//     const splitX = tf.split(img, 2, 0);
//     console.log(`🚀 ~~~~~~~ readAndSplit ~~~~~~~ spliting the img`);
//     // Iterate over the 4 images
//     splitX.forEach((tensorX, x) => {
//         const splitY = tf.split(tensorX, 2, 1);
//         splitY.forEach((tensor, i) => {
//             const resizedTensor = tf.image.resizeBilinear(tensor, [256, 256]);
//             write(resizedTensor, i, x, name, project, ref);
//         });
//     });
// }
export { readAndSplit, uploadImgToDiscord, sendImgToJourney, screenBrowser, sleep }