const TelegramBot = require('node-telegram-bot-api');
const token = '6314185706:AAE3PojRgeQU2kh9gZvChRI9BSwGBT1czYw';
const bot = new TelegramBot(token, { polling: true });
module.exports = bot