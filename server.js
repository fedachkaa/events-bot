import express from "express";
import mongoose from "mongoose";

import * as EventsController from "./controllers/EventsController.js";
import * as Validator from "./validation/validator.js";

export const startServerAndDB = () => {
  mongoose
    .connect(
      `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@events-bot.90qmri6.mongodb.net/${process.env.DB_NAME}`
    )
    .then(() => console.log("DB conected"))
    .catch((err) => console.log("DB error", err));

  const app = express();

  app.use(express.json());

  const PORT = process.env.PORT || 3002;

  app.listen(PORT, (err) => {
    console.log(`Server started on port ${PORT}`);
    if (err) {
      return console.log(err);
    }
  });

  app.post(
    "/api/v1/events/new",
    Validator.eventValidator(),
    EventsController.createEvent
  );
};
