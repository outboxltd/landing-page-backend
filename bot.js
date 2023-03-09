const { Bot, session, InlineKeyboard } = require("grammy");
const axios = require(`axios`);
const User = require("./models/userModel.js")
const { upload, compressImage } = require('./upload.js')
const { hydrateFiles } = require("@grammyjs/files");
const path = require('path');
const fs = require('fs');

require("dotenv").config();
const BASE_URL = process.env.NODE_ENV === 'production' ? 'https://landing-page-backend.onrender.com' : 'http://localhost:8000';


const {
    LPPairs,
    checkPhoneExist,
    updateUserTelegramId,
    checkTelegramIdExist,
    getUserLPsByUid,
    sendMessage,
    markupStartingOptions,
    markupUserEvents,
    setCurrentLP,
    addNewLP,
    DeleteLP
} = require('./botUtills.js');

const dest = path.join(__dirname, './uploads');

const bot = new Bot(process.env.BOT_TOKEN);

bot.api.config.use(hydrateFiles(process.env.BOT_TOKEN));

bot.use(session({
    initial: () => ({
        user: null,
        userLandingPages: null,
        currentLP: null,
        smsTokenFlag: {
            token: '',
            flag: false
        },
        editLPFlag: {
            flag: false,
            field: ''
        },
        newLPFlag: {
            flag: false,
            values: {},
            index: 0
        },
        editEventMessagesFlag: {
            flag: false,
            type: ''
        },
        scheduleMessageFlag: {
            flag: false,
            typeNumber: -1,
            type: '',
            values: {},
            index: 0
        }
    })
}));

//?start command
bot.command("start", async (ctx) => {
    ctx.session.user = await checkTelegramIdExist(ctx.message.from.id);
    if (ctx.session.user) {
        ctx.session.userLandingPages = await getUserLPsByUid(ctx.session.user.uid);
        if (ctx.session.userLandingPages.length === 1) {
            ctx.session.currentLP = ctx.session.userLandingPages[0];
            markupStartingOptions(ctx, ctx.session.userLandingPages.length === 0);
            return;
        }
        markupUserEvents(ctx);
        return;

    }
    ctx.reply(`Hello, send your phone number to start!`);
});




//?when a button is clicked

bot.on("callback_query:data", async (ctx) => {
    const query = ctx.callbackQuery.data;

    if (query === 'Create New Landing Page') {
        ctx.session.newLPFlag.flag = true;
        ctx.session.currentLP = null;
        await ctx.reply('Creating New LP');
        await ctx.reply(Object.values(LPPairs)[ctx.session.newLPFlag.index].alternative);
    }

    if (query === 'delete lp') {
        DeleteLP(ctx)
        await ctx.reply('Landing page deleted');
        markupUserEvents(ctx);
    }

    if (!ctx.session.currentLP && await setCurrentLP(ctx, query)) {
        markupStartingOptions(ctx);
        return;
    }


    if (query === 'Cancel') {
        ctx.session.currentLP = null;
        markupUserEvents(ctx);
        return;
    }


    await ctx.answerCallbackQuery();
});


//?when a message is sent

bot.on("message", async (ctx) => {
    //* if received a phone number
    if (ctx.message.entities !== undefined && ctx.message.entities[0].type === "phone_number") {
        if (ctx.session.user) {
            ctx.session.userEvents = await getUserLPsByUid(ctx.session.user.uid);
            if (ctx.session.userEvents.length === 1) {
                ctx.session.currentLP = ctx.session.userEvents[0];
                markupStartingOptions(ctx);
                return;
            }
            ctx.reply('number identified')
        }


        ctx.session.user = await checkPhoneExist(ctx.message.text);
        if (ctx.session.user) {
            const smsToken = Math.floor(Math.random() * 10000 + 1000).toString();
            ctx.session.smsTokenFlag.token = smsToken;
            ctx.session.smsTokenFlag.flag = true;
            sendMessage(ctx.message.text, `Your Temporary Verification Token is ${smsToken}`);
            ctx.reply('A Verification Token is Sent To The Provided Number! Send it Back Here To Verify');
            return;
        }
        ctx.reply('phone number not found');
        return;
    }

    if (ctx.session.smsTokenFlag.flag) {
        if (ctx.message.text !== ctx.session.smsTokenFlag.token.toString()) {
            ctx.reply('The Provided Token is invalid');
            return;
        }

        if (!ctx.session.user.telegram_id) {
            await updateUserTelegramId(ctx.session.user.id, ctx.message.from.id.toString());
        }

        await ctx.reply('Verified Successfully!');
        ctx.session.smsTokenFlag.token = '';
        ctx.session.smsTokenFlag.flag = false;
        markupUserEvents(ctx)
    }
    if (ctx.session.newLPFlag.flag) {
        let value = Object.values(LPPairs)[ctx.session.newLPFlag.index];
        if(ctx.message.text==="null"){
            ctx.session.newLPFlag.values[value.dbColumn] = null;
        }
        else{
            ctx.session.newLPFlag.values[value.dbColumn] = ctx.message.text;
        }

        if(ctx.update.message.photo){
            if(value.dbColumn==="hero"){
                const file = await ctx.getFile();
                // Download the file to a temporary location.
                const path = await file.download(`${dest}/hero.webp`);
                // Print the file path.
                console.log("File saved at ", path);
            }
            if(value.dbColumn==="image1"){
                const file = await ctx.getFile();
                // Download the file to a temporary location.
                const path = await file.download(`${dest}/image1.webp`);
                // Print the file path.
                console.log("File saved at ", path);
            }
            if(value.dbColumn==="image2"){
                const file = await ctx.getFile();
                // Download the file to a temporary location.
                const path = await file.download(`${dest}/image2.webp`);
                // Print the file path.
                console.log("File saved at ", path);
            }
            if(value.dbColumn==="image3"){
                const file = await ctx.getFile();
                // Download the file to a temporary location.
                const path = await file.download(`${dest}/image3.webp`);
                // Print the file path.
                console.log("File saved at ", path);
            }
            if(value.dbColumn==="testimonialImg1"){
                const file = await ctx.getFile();
                // Download the file to a temporary location.
                const path = await file.download(`${dest}/testimonialImg1.webp`);
                // Print the file path.
                console.log("File saved at ", path);
            }
            if(value.dbColumn==="testimonialImg2"){
                const file = await ctx.getFile();
                // Download the file to a temporary location.
                const path = await file.download(`${dest}/testimonialImg2.webp`);
                // Print the file path.
                console.log("File saved at ", path);
            }
            if(value.dbColumn==="testimonialImg3"){
                const file = await ctx.getFile();
                // Download the file to a temporary location.
                const path = await file.download(`${dest}/testimonialImg3.webp`);
                // Print the file path.
                console.log("File saved at ", path);
            }
        }
        if (Object.keys(ctx.session.newLPFlag.values).length === Object.keys(LPPairs).length) {
            ctx.session.newLPFlag.values.uid = ctx.session.user.uid;
            const addedLP = await addNewLP(ctx.session.newLPFlag.values);
            const id=addedLP.id;
            const filesToUpdate = ['hero', 'image1', 'image2', 'image3', 'testimonialImg1', 'testimonialImg2', 'testimonialImg3'];
            for (const file of filesToUpdate) {
                // const file = req.files[fieldName];
                if (file) {
                    const fileData = file[0];
                    let prefix = '';
                    if (file === 'hero') {
                        prefix = 'hero';
                    } else if (file.startsWith('image')) {
                        prefix = `image${file.slice(-1)}`;
                    } else {
                        prefix = `testimonialImg${file.slice(-1)}`;
                    }
                    // const extension = fileData.originalname.split('.').pop();
                    const oldFilePath = `./uploads/${prefix}.webp`;
                    const newFilePath = `./uploads/${id}-${prefix}.webp`.replace(/\s+/g, '-');
                    if (fs.existsSync(oldFilePath)) {
                        fs.renameSync(oldFilePath, newFilePath);
                    } else {
                        console.log(`File ${oldFilePath} not found.`);
                    }
                }
            }
            const imagePath = (imageName) => `${BASE_URL}/uploads/${id}-${imageName}`;

            updatedCompany = {
                ...addedLP,
                hero: imagePath('hero.webp'),
                image1: imagePath('image1.webp'),
                image2: imagePath('image2.webp'),
                image3: imagePath('image3.webp'),
                testimonialImg1: imagePath('testimonialImg1.webp'),
                testimonialImg2: imagePath('testimonialImg2.webp'),
                testimonialImg3: imagePath('testimonialImg3.webp')
            };
            await addedLP.update(updatedCompany);
            ctx.session.newLPFlag.flag = false;
            ctx.session.newLPFlag.values = {};
            ctx.session.newLPFlag.index = 0;
            if (addedLP) {
                markupUserEvents(ctx, true, 'Company Added Successfully');
                return;
            }
            ctx.reply('something went wrong');
            return;
        }
        ctx.session.newLPFlag.index += 1;
        value = Object.values(LPPairs)[ctx.session.newLPFlag.index];
        ctx.reply(value.alternative);
        return;
    }

    // bot.on(":photo", async (ctx) => {
    //     // Prepare the file for download.
    //     const file = await ctx.getFile();
    //     // Download the file to a temporary location.
    //     const url = file.getUrl();
    //     const path = await file.download(`${dest}/file1.webp`);
    //     // Print the file path.
    //     console.log("File saved at ", path);
    // })


});

bot.start();
