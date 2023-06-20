import User from '../models/User.js';

export const userExists = async (telegramId) => {
  const user = await User.exists({ telegramId });
  return user;
};

export const signup = async (userData, location) => {
  const {
    id: telegramId,
    first_name: firstName,
    last_name: lastName,
    username,
  } = userData;

  if (await userExists(telegramId)) return;

  const doc = new User({
    telegramId,
    firstName,
    lastName,
    username,
    location,
  });

  await doc.save();
};

export const getGeolocation = async (location) => {
  const { latitude, longitude } = location;

  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
  );
  const data = await response.json();
  console.log(data);
};
