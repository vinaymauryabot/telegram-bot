const TelegramBot = require("node-telegram-bot-api");

const token = process.env.BOT_TOKEN;

const bot = new TelegramBot(token, { polling: true });

// Simple keyword database
const database = {
  hello: "Hello bhai 👋",
  price: "Price list link: https://yourlink.com",
  demo: "Demo file link: https://yourlink.com/demo"
};

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.toLowerCase();

  if (database[text]) {
    bot.sendMessage(chatId, database[text]);
  } else {
    bot.sendMessage(chatId, "Keyword not found ❌");
  }
});
