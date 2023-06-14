import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
dotenv.config();

const token = process.env.TOKEN;

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "Привіт! Я бот-організатор подій. Тут відображатимуться різні події твого міста!",
    {
      reply_markup: {
        keyboard: [
          ["Усі події"],
          ["Події по тегу", "Події по місту"],
          ["Мої події"],
        ],
      },
    }
  );
});

bot.on("message", (msg) => {
  const allEvents = "усі події";
  if (msg.text.toString().toLowerCase() === allEvents) {
    bot.sendMessage(msg.chat.id, "Тут будуть усі події.");
  }
  const eventsByTag = "події по тегу";
  if (msg.text.toString().toLowerCase() === eventsByTag) {
    bot.sendMessage(msg.chat.id, "Тут будуть події по обраному тегу.");
  }
  const eventsByCity = "події по місту";
  if (msg.text.toString().toLowerCase() === eventsByCity) {
    bot.sendMessage(msg.chat.id, "Тут будуть події в обраному місті.");
  }
  const myEvents = "мої події";
  if (msg.text.toString().toLowerCase() === myEvents) {
    bot.sendMessage(msg.chat.id, "Тут будуть ваші події.");
  }
});
