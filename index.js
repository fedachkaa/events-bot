import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';
import * as EventsController from './controllers/EventsController.js';
import * as UserController from './controllers/UserController.js';
import startServerAndDB from './server.js';
import * as Formatter from './utils/format.js';

dotenv.config();

startServerAndDB();

const token = process.env.TOKEN;

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    'Привіт! Я бот-організатор подій. Тут відображатимуться різні події твого міста!',
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Зареєструватись', callback_data: 'signup' },
          ],
        ],
      },
    },
  );
});

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const user = query.from;
  const buttonClicked = query.data;
  const year = new Date().getFullYear();

  switch (true) {
    case buttonClicked === 'signup':
      try {
        if (await UserController.userExists(user.id)) throw new Error('User already exists');
        bot.sendMessage(chatId, 'Введіть ваше *місто*:', {
          parse_mode: 'Markdown',
        });
        bot.once('message', async (msg) => {
          UserController.signup(msg.from, msg.text);
          bot.sendMessage(msg.chat.id, 'Реєстрація пройшла успішно!');
        });
      } catch (err) {
        bot.sendMessage(
          chatId,
          'Ви уже зареєстровані :)',
          {
            reply_markup: menuInlineKeyboard,
          },
        );
      }
      break;

    case buttonClicked === 'allEvents': {
      const events = await EventsController.getAllEvents();
      events.forEach((event) => sendEvent(chatId, event));
      break;
    }

    case buttonClicked.includes('saveEvent'):
      try {
        const id = buttonClicked.split(' ')[1];
        const res = await EventsController.saveEvent(user.id, id);
        bot.sendMessage(chatId, `Подія ${res.title} успішно збережена!`, {
          reply_markup: menuInlineKeyboard,
        });
      } catch (err) {
        console.log(err);
        bot.sendMessage(chatId, 'Подія уже є в списку збережених подій!', {
          reply_markup: menuInlineKeyboard,
        });
      }
      break;

    case buttonClicked === 'myEvents': {
      const userEvents = await EventsController.userEvents(user.id);
      if (userEvents.length === 0) {
        bot.sendMessage(chatId, 'У вас ще немає збережених подій.', {
          reply_markup: menuInlineKeyboard,
        });
        return;
      }
      const text = Formatter.formatUserEvents(userEvents);
      bot.sendMessage(chatId, text, {
        parse_mode: 'HTML',
        reply_markup: menuInlineKeyboard,
      });
      break;
    }

    case buttonClicked === 'eventByTag':
      bot.sendMessage(chatId, 'Введіть тег (концерт, театр тощо):');
      bot.once('message', async (msg) => {
        const eventsByTag = await EventsController.eventsByTag(msg.text);
        if (eventsByTag.length === 0) {
          bot.sendMessage(chatId, `Не вдалось знайти події з тегом "${msg.text}" :(`, { reply_markup: menuInlineKeyboard });
        }
        eventsByTag.forEach((event) => sendEvent(chatId, event));
      });
      break;

    case buttonClicked === 'eventsByCity':
      bot.sendMessage(chatId, 'Введіть місто:');
      bot.once('message', async (msg) => {
        const eventsByCity = await EventsController.eventsByCity(msg.text);
        if (eventsByCity.length === 0) {
          bot.sendMessage(chatId, `Не вдалось знайти події в місті ${msg.text} :(`, { reply_markup: menuInlineKeyboard });
        }
        eventsByCity.forEach((event) => sendEvent(chatId, event));
      });
      break;

    case buttonClicked === 'eventsByDate':
      bot.sendMessage(chatId, `Виберіть місяць ${year} року:`, { reply_markup: monthmenuInlineKeyboard });
      break;

    case buttonClicked.includes('month'): {
      const month = buttonClicked.split(' ')[1];
      bot.sendMessage(chatId, 'Виберіть число місяця:', { reply_markup: { inline_keyboard: generateCalendarKeyboard(+month) } });
      break;
    }

    case buttonClicked.includes('day'): {
      const day = Number(buttonClicked.split(' ')[1]);
      const month = Number(buttonClicked.split(' ')[2]);
      const eventsByDate = await EventsController.eventsByDate(day, month, year);

      if (eventsByDate.length === 0) {
        bot.sendMessage(chatId, `Не вдалось знайти події, які відбуваються ${day.toString().padStart(2, 0)}-${(month + 1).toString().padStart(2, 0)}-${year}`, { reply_markup: menuInlineKeyboard });
      }

      eventsByDate.forEach((event) => sendEvent(chatId, event));
      break;
    }

    case buttonClicked === 'menu':
      bot.sendMessage(chatId, 'Меню:', { reply_markup: menuInlineKeyboard });
      break;

    default:
      bot.sendMessage(chatId, 'Щось пішло не так...Спробуйте пізніше');
  }

  bot.answerCallbackQuery(query.id);
});

function sendEvent(chatId, event) {
  bot.sendPhoto(chatId, `${event.img}`, {
    caption: Formatter.formatEventMessage(event),
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'Детальніше 🌐', url: `${event.link}` },
          {
            text: 'Зберегти ❤️',
            callback_data: `saveEvent ${event.id}`,
          },
        ],
        [{ text: 'Меню', callback_data: 'menu' }],
      ],
    },
  });
}

function generateCalendarKeyboard(month) {
  const inlineKeyboard = [];
  const daysInMonth = new Date(2023, month + 1, 0).getDate();
  let temp = [];
  for (let day = 1; day <= daysInMonth; day += 1) {
    temp.push({
      text: day.toString(),
      callback_data: `day ${day} ${month}`,
    });
    if (day % 7 === 0) {
      inlineKeyboard.push(Array.from(temp));
      temp = [];
    }
  }
  inlineKeyboard.push(Array.from(temp));

  return inlineKeyboard;
}

const menuInlineKeyboard = {
  inline_keyboard: [
    [{ text: 'Усі події', callback_data: 'allEvents' }],
    [{ text: 'Події по тегу', callback_data: 'eventByTag' }],
    [{ text: 'Події по місту', callback_data: 'eventsByCity' }],
    [{ text: 'Події по даті', callback_data: 'eventsByDate' }],
    [{ text: 'Мої події', callback_data: 'myEvents' }],
  ],
};

const monthmenuInlineKeyboard = {
  inline_keyboard: [
    [{ text: 'Грудень', callback_data: `month ${11}` }, { text: 'Січень', callback_data: `month ${0}` }, { text: 'Лютий', callback_data: `month ${1}` }],
    [{ text: 'Березень', callback_data: `month ${2}` }, { text: 'Квітень', callback_data: `month ${3}` }, { text: 'Травень', callback_data: `month ${4}` }],
    [{ text: 'Червень', callback_data: `month ${5}` }, { text: 'Липень', callback_data: `month ${6}` }, { text: 'Серпень', callback_data: `month ${7}` }],
    [{ text: 'Вересень', callback_data: `month ${8}` }, { text: 'Жовтень', callback_data: `month ${9}` }, { text: 'Листопад', callback_data: `month ${10}` }],
  ],
};
