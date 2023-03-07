const { Bot,session  } = require("grammy");
const axios = require(`axios`);
const User = require("./models/userModel.js")

require("dotenv").config();


const checkTelegramIdExist = async (telegramId) => {
    const user = await User.findOne({ where: { telegramId: telegramId } });
    return user;
};

const checkPhoneExist = async (phoneNumber) => {
    const user = await User.findOne({ where: { phoneNumber }, });
    return user;
};
const updateUserTelegramId = async (id, telegramId) => {

    await User.update({ telegramId },{where: { id }});
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



const bot = new Bot(process.env.BOT_TOKEN);



bot.use(session({
    initial: () => ({
        user: null,
        userEvents: null,
        currentEvent: null,
        smsTokenFlag: {
            token: '',
            flag: false
        },
        editEventFlag: {
            flag: false,
            field: ''
        },
        newEventFlag: {
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

bot.command("start", async (ctx) => {
    ctx.session.user = await checkTelegramIdExist(ctx.message.from.id);
    if (ctx.session.user) {
    ctx.session.userEvents = await getUserEvents(ctx.session.user.hash);
    if (ctx.session.userEvents.length === 1) {
        ctx.session.currentEvent = ctx.session.userEvents[0];
        markupStartingOptions(ctx, ctx.session.userEvents.length === 0);
        return;
    }
    markupUserEvents(ctx);
    return;

    }
    ctx.reply(`Hello, send your phone number to start!`);
});

bot.on("message", async (ctx) => {
    //* if received a phone number
    if (ctx.message.entities !== undefined && ctx.message.entities[0].type === "phone_number") {
        if (ctx.session.user) {
            ctx.session.userEvents = await getUserEvents(ctx.session.user.hash);
            if (ctx.session.userEvents.length === 1) {
                ctx.session.currentEvent = ctx.session.userEvents[0];
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


    }
}
);

bot.start();
