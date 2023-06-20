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
            { text: 'Авторизуватись', callback_data: 'auth' },
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
  const inlineKeyboard = {
    inline_keyboard: [
      [{ text: 'Усі події', callback_data: 'allEvents' }],
      [{ text: 'Події по тегу', callback_data: 'eventByTag' }],
      [{ text: 'Події по місту', callback_data: 'eventsByCity' }],
      [{ text: 'Мої події', callback_data: 'myEvents' }],
    ],
  };

  switch (true) {
    case buttonClicked === 'signup':
      try {
        if (await UserController.userExists(user.id)) throw new Error('User already exists');
        bot.sendMessage(chatId, 'Введіть ваше *місто*:', {
          parse_mode: 'Markdown',
        });
        bot.on('message', (msg) => {
          UserController.signup(msg.from, msg.text);
          bot.sendMessage(chatId, 'Реєстрація пройшла успішно!');
        });
      } catch (err) {
        const inlineKeyboardAuth = {
          inline_keyboard: [
            [{ text: 'Авторизуватись', callback_data: 'auth' }],
          ],
        };
        bot.sendMessage(
          chatId,
          'Ви уже зареєстровані. Авторизуйтесь, будь ласка:',
          {
            reply_markup: inlineKeyboardAuth,
          },
        );
      }
      break;

    case buttonClicked === 'auth':
      bot.sendMessage(
        chatId,
        `Привіт, ${user.first_name}, авторизація пройшла успішно!`,
        {
          reply_markup: inlineKeyboard,
        },
      );
      break;

    case buttonClicked === 'allEvents': {
      const events = await EventsController.getAllEvents();
      events.forEach((event) => {
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
      });
      break;
    }

    case buttonClicked.includes('saveEvent'):
      try {
        const id = buttonClicked.split(' ')[1];
        const res = await EventsController.saveEvent(user.id, id);
        bot.sendMessage(chatId, `Подія ${res.title} успішно збережена!`, {
          reply_markup: inlineKeyboard,
        });
      } catch (err) {
        console.log(err);
        bot.sendMessage(chatId, 'Подія уже є в списку збережених подій!', {
          reply_markup: inlineKeyboard,
        });
      }
      break;

    case buttonClicked === 'myEvents': {
      const userEvents = await EventsController.userEvents(user.id);
      if (userEvents.length) {
        const text = Formatter.formatUserEvents(userEvents);
        bot.sendMessage(chatId, text, {
          parse_mode: 'HTML',
          reply_markup: inlineKeyboard,
        });
      } else {
        bot.sendMessage(chatId, 'У вас ще немає збережених подій.', {
          reply_markup: inlineKeyboard,
        });
      }
      break;
    }

    case buttonClicked === 'menu':
      bot.sendMessage(chatId, 'Меню:', { reply_markup: inlineKeyboard });
      break;
    default:
      bot.sendMessage(chatId, 'Щось пішло не так...Спробуйте пізніше');
  }

  bot.answerCallbackQuery(query.id);
});

/// GEOLOCATION
// bot.onText(/\/location/, (msg) => {
//   const chatId = msg.chat.id;
//   const messageId = msg.message_id;

//   // Відправка запиту на отримання геолокації
//   bot.sendMessage(chatId, "Будь ласка, надішліть своє місцезнаходження.", {
//     reply_markup: {
//       keyboard: [
//         [
//           {
//             text: "Надіслати місцезнаходження",
//             request_location: true, // Включаємо запит на геолокацію
//           },
//         ],
//       ],
//       one_time_keyboard: true, // Показуємо клавіатуру лише один раз
//     },
//   });
// });

// bot.on("location", (msg) => {
//   const chatId = msg.chat.id;
//   const latitude = msg.location.latitude;
//   const longitude = msg.location.longitude;

//   UserController.getGeolocation(msg.location);

//   bot.sendMessage(chatId, `Ваша геолокація: ${latitude}, ${longitude}`);
// });

// bot.on("message", (msg) => {
//   const allEvents = "усі події";
//   if (msg.text.toString().toLowerCase() === allEvents) {
//     bot.sendMessage(msg.chat.id, "Тут будуть усі події.");
//   }
//   const eventsByTag = "події по тегу";
//   if (msg.text.toString().toLowerCase() === eventsByTag) {
//     bot.sendMessage(msg.chat.id, "Тут будуть події по обраному тегу.");
//   }
//   const eventsByCity = "події по місту";
//   if (msg.text.toString().toLowerCase() === eventsByCity) {
//     bot.sendMessage(msg.chat.id, "Тут будуть події в обраному місті.");
//   }
//   const myEvents = "мої події";
//   if (msg.text.toString().toLowerCase() === myEvents) {
//     bot.sendMessage(msg.chat.id, "Тут будуть ваші події.");
//   }
// });
