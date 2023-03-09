const { Bot, session, InlineKeyboard } = require("grammy");
const axios = require(`axios`);
const User = require("./models/userModel.js")
const LandingPage = require("./models/companyModel.js")
const { upload, compressImage } = require('./upload.js')

const LPPairs = {
    brand: { dbColumn: 'brand', alternative: 'company name' },
    isRTL: { dbColumn: 'isRTL', alternative: 'is the landing page in hebrew (true/false)'},
    // topButtonText: { dbColumn: 'topButtonText', alternative: 'top Button Text ( if you want this field to be empty write null)' },
    // topButtonLink: { dbColumn: 'topButtonLink', alternative: 'top Button Link ( if you want this field to be empty write null)' },
    // signupButtonText: { dbColumn: 'signupButtonText', alternative: 'signup Button Text' },
    mainTitle: { dbColumn: 'mainTitle', alternative: 'main Title' },
    subTitle: { dbColumn: 'subTitle', alternative: 'sub Title' },
    isEmailAvailableInForm: { dbColumn: 'isEmailAvailableInForm', alternative: 'is Email Available In Form (true/false)'},
    isNameAvailableInForm: { dbColumn: 'isNameAvailableInForm', alternative: 'is Name Available In Form (true/false)' },
    isPhoneAvailableInForm: { dbColumn: 'isPhoneAvailableInForm', alternative: 'is Phone Available In Form (true/false)'  },
    icon1: { dbColumn: 'icon1', alternative: 'icon 1 ( if you want this field to be empty write null)' },
    middleTitle1: { dbColumn: 'middleTitle1', alternative: 'middle Title 1 ( if you want this field to be empty write null)' },
    middleText1: { dbColumn: 'middleText1', alternative: 'middle Text 1 ( if you want this field to be empty write null)' },
    icon2: { dbColumn: 'icon2', alternative: 'icon 2 ( if you want this field to be empty write null)' },
    middleTitle2: { dbColumn: 'middleTitle2', alternative: 'middle Title 2 ( if you want this field to be empty write null)' },
    middleText2: { dbColumn: 'middleText2', alternative: 'middle Text 2 ( if you want this field to be empty write null)'},
    icon3: { dbColumn: 'icon3', alternative: 'icon 3 ( if you want this field to be empty write null)' },
    middleTitle3: { dbColumn: 'middleTitle3', alternative: 'middle Title 3 ( if you want this field to be empty write null)' },
    middleText3: { dbColumn: 'middleText3', alternative: 'middle Text 3 ( if you want this field to be empty write null)' },
    title1: { dbColumn: 'title1', alternative: 'title 1 ( if you want this field to be empty write null)' },
    description1: { dbColumn: 'description1', alternative: 'description1 ( if you want this field to be empty write null)' },
    title2: { dbColumn: 'title2', alternative: ' title 2 ( if you want this field to be empty write null)' },
    description2: { dbColumn: 'description2', alternative: 'description 2 ( if you want this field to be empty write null)' },
    title3: { dbColumn: 'title3', alternative: 'title 3 ( if you want this field to be empty write null)'},
    description3: { dbColumn: 'description3', alternative: 'description 3 ( if you want this field to be empty write null)' },
    hero: { dbColumn: 'hero', alternative: 'hero image ( if you want this field to be empty write null)' },
    heroAlt: { dbColumn: 'heroAlt', alternative: 'hero Alt ( if you want this field to be empty write null)' },
    image1: { dbColumn: 'image1', alternative: 'image 1 ( if you want this field to be empty write null)' },
    image1Alt: { dbColumn: 'image1Alt', alternative: 'image 1 Alt ( if you want this field to be empty write null)' },
    image2: { dbColumn: 'image2', alternative: 'image 2 ( if you want this field to be empty write null)' },
    image2Alt: { dbColumn: 'image2Alt', alternative: 'image 2 Alt ( if you want this field to be empty write null)' },
    image3: { dbColumn: 'image3', alternative: 'image 3 ( if you want this field to be empty write null)'},
    image3Alt: { dbColumn: 'image3Alt', alternative: 'image 3 Alt ( if you want this field to be empty write null)' },
    testimonialName1: { dbColumn: 'testimonialName1', alternative: 'testimonial Name 1 ( if you want this field to be empty write null)' },
    testimonialText1: { dbColumn: 'testimonialText1', alternative: 'testimonial Text 1 ( if you want this field to be empty write null)' },
    testimonialImg1: { dbColumn: 'testimonialImg1', alternative: 'testimonial Img 1 ( if you want this field to be empty write null)' },
    testimonialImg1Alt: { dbColumn: 'testimonialImg1Alt', alternative: 'testimonial Img 1 Alt ( if you want this field to be empty write null)' },
    testimonialName2: { dbColumn: 'testimonialName2', alternative: 'testimonial Name 2 ( if you want this field to be empty write null)' },
    testimonialText2: { dbColumn: 'testimonialText2', alternative: 'testimonial Text 2 ( if you want this field to be empty write null)' },
    testimonialImg2: { dbColumn: 'testimonialImg2', alternative: 'testimonial Img 2 ( if you want this field to be empty write null)' },
    testimonialImg2Alt: { dbColumn: 'testimonialImg2Alt', alternative: 'testimonial Img 2 Alt ( if you want this field to be empty write null)' },
    testimonialName3: { dbColumn: 'testimonialName3', alternative: 'testimonial Name 3 ( if you want this field to be empty write null)'},
    testimonialImg3: { dbColumn: 'testimonialImg3', alternative: 'testimonial Img 3 ( if you want this field to be empty write null)' },
    testimonialText3: { dbColumn: 'testimonialText3', alternative: 'testimonial Text 3 ( if you want this field to be empty write null)' },
    testimonialImg3Alt: { dbColumn: 'testimonialImg3Alt', alternative: 'testimonial Img 3 Alt ( if you want this field to be empty write null)' },
    bottomFormHeader: { dbColumn: 'bottomFormHeader', alternative: 'bottom Form Header ( if you want this field to be empty write null)' },
    aboutAddress: { dbColumn: 'aboutAddress', alternative: 'about Address ( if you want this field to be empty write null)' },
    contactAddress: { dbColumn: 'contactAddress', alternative: 'contact Address ( if you want this field to be empty write null)' },
    termsAddress: { dbColumn: 'termsAddress', alternative: 'terms Address ( if you want this field to be empty write null)' },
    privacyAddress: { dbColumn: 'privacyAddress', alternative: 'privacy Address' },
    facebookAddress: { dbColumn: 'facebookAddress', alternative: 'facebook Address ( if you want this field to be empty write null)' },
    twitterAddress: { dbColumn: 'twitterAddress', alternative: 'twitter Address ( if you want this field to be empty write null)' },
    instagramAddress: { dbColumn: 'instagramAddress', alternative: 'instagram Address ( if you want this field to be empty write null)' },
    script: { dbColumn: 'script', alternative: 'Do you want to add script ( if you want this field to be empty write null) ' },
    googleAnalyticsCode: { dbColumn: 'googleAnalyticsCode', alternative: 'Do you want to add script googleAnalyticsCode ( if you want this field to be empty write null)' },
};

const checkTelegramIdExist = async (telegramId) => {
    const user = await User.findOne({ where: { telegramId: telegramId } });
    return user;
};

const checkPhoneExist = async (phoneNumber) => {
    const user = await User.findOne({ where: { phoneNumber }, });
    return user;
};
const updateUserTelegramId = async (id, telegramId) => {

    await User.update({ telegramId }, { where: { id } });
};


const getUserLPsByUid = async (uid) => {
    const landingPages = await LandingPage.findAll({
        where: { uid: uid },
    });
    return landingPages;
};

const FromNumber = 'LandingPageBot';
const Token = process.env.MESSAGE_TOKEN;

const sendMessage = (ToNumber, MassageText) => {
    let config = {
        method: `get`,
        url: `http://www.micropay.co.il/ExtApi/ScheduleSms.php?get=1&token=${Token}&msg=${MassageText}&list=${ToNumber}&from=${FromNumber}`,
        headers: {}
    };
    axios(config)
        .then((response) => {
            console.log(JSON.stringify(response.data));
        })
        .catch((error) => {
            console.log(error);
        });
};

const markupStartingOptions = async (ctx, userHasNoLPs) => {
    const inlineKeyboard = new InlineKeyboard();

    if (userHasNoLPs) {
        inlineKeyboard.text('New Landing Page').row();
        ctx.reply("Hello, what you want to do ?", { reply_markup: inlineKeyboard });
        return;
    }

    inlineKeyboard.text('Edit Current Landing Page', 'Edit Landing Page').row();
    inlineKeyboard.text('Delete Current Landing page', 'delete lp').row();
    inlineKeyboard.text('Choose A Different Landing Page or Create A New Landing Page', 'Cancel').row();
    await ctx.reply(`Hello, what you want to do ? current LP is ${ctx.session.currentLP.brand}`, { reply_markup: inlineKeyboard });
};

const markupUserLPs = async (ctx, isSecondTime, message) => {
    const inlineKeyboard = new InlineKeyboard();
    ctx.session.userLandingPages = await getUserLPsByUid(ctx.session.user.uid);
    ctx.session.userLandingPages.forEach(lp => {
        inlineKeyboard.text(lp.brand).row();
    });
    inlineKeyboard.text('Create New Landing Page').row();

    if (isSecondTime) {
        ctx.reply(message, { reply_markup: inlineKeyboard });
    }
    else {
        ctx.reply("Choose a Landing Page to Start", { reply_markup: inlineKeyboard });
    }
    return;
};

const markupUserLPFields = async (ctx, isAnotherUpdate, message) => {
    const inlineKeyboard = new InlineKeyboard();



    Object.keys(LPPairs).forEach(key => {
        inlineKeyboard.text(key, key).row();
    });
    inlineKeyboard.text('ביטול', 'Cancel').row();

    if (isAnotherUpdate) {
        ctx.reply(message, { reply_markup: inlineKeyboard });
    }
    else {
        ctx.reply('what do you want to edit?', { reply_markup: inlineKeyboard });
    }
};

const addNewLP = async (lp) => {
    const createdCompany = await LandingPage.create(lp);
    const user = await User.findOne({ where: { uid: lp.uid } });
    console.log(user);
    // const companyIds = user.companyIds.length()!==0? user.companyIds: [];
    // if (!companyIds.includes(lp.id)) {
    //     companyIds.push(lp.id);
    // }
    // await user.update({ companyIds });
    return createdCompany;

};


const editLP = async (lp) => {
    const landingPage = await LandingPage.findByPk(lp.id);
    await landingPage.update(lp);
    return landingPage;
}

const setCurrentLP = (ctx, query) => {
    if (ctx.session.userLandingPages?.length === 1) {
        ctx.session.currentLP = ctx.session.userLandingPages[0];
        return ctx.session.currentLP;
    }

    ctx.session.userLandingPages?.forEach(lp => {
        if (lp.brand === query) {
            ctx.session.currentLP = lp;
        }
    });

    return ctx.session.currentLP;
};

const DeleteLP=async (ctx)=>{
    const landingPage = await LandingPage.findByPk(ctx.session.currentLP.id);
    await landingPage.destroy();
    return landingPage
}
module.exports = {
    LPPairs,
    checkPhoneExist,
    updateUserTelegramId,
    checkTelegramIdExist,
    getUserLPsByUid,
    sendMessage,
    markupStartingOptions,
    markupUserLPs,
    setCurrentLP,
    addNewLP,
    DeleteLP,
    markupUserLPFields,
    editLP
};