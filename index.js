const TelegramBot = require('node-telegram-bot-api');

// Environment variable se token le raha hai
const token = process.env.BOT_TOKEN;

// Bot start
const bot = new TelegramBot(token, { polling: true });

console.log("Bot is running...");

// /start command
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Hello Vinay 👋\nBot successfully working 🚀");
});

// Agar koi aur message bheje
bot.on("message", (msg) => {
  if (msg.text !== "/start") {
    bot.sendMessage(msg.chat.id, "Keyword not found ❌\nType /start");
  }
});
// Dummy server for Render
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Bot is running 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
