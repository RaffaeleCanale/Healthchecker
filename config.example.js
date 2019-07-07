module.exports = {
    hooks: [
        {
            type: 'Telegram',
            token: process.env.TELEGRAM_TOKEN,
            chatId: process.env.TELEGRAM_CHAT_ID,
        },
    ],
    interval: -1,
};
