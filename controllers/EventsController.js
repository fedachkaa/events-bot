import Event from "../models/Event.js";
import User from "../models/User.js";
import { validationResult } from "express-validator";

export const createEvent = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { title, description, img, date, location, link, tags } = req.body;

    if (await Event.findOne({ title }))
      return res.status(400).json({ message: "This event already exists" });

    const doc = new Event({
      title,
      description,
      img,
      date,
      location,
      link,
      tags,
    });
    const event = await doc.save();
    res.json({
      event,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Failed to verify data.",
    });
  }
};

export const getAllEvents = async () => {
  const events = await Event.find();
  const filteredEvents = events.filter((e) => new Date(e.date) > new Date());
  return filteredEvents;
};

export const saveEvent = async (telegramId, eventId) => {
  const event = await Event.findById(eventId);
  const user = await User.findOne({ telegramId });

  if (user.events.some((savedEvent) => savedEvent._id.equals(event._id)))
    throw new Error("Подія уже є в списку збережених.");

  user.events.push(event);
  await user.save();
  return event;
};

export const userEvents = async (telegramId) => {
  const user = await User.findOne({ telegramId });
  return user.events;
};
