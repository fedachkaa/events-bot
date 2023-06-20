import { body } from "express-validator";

export const eventValidator = () => {
  return [
    body("title", "Make sure the title is entered correctly.").not().isEmpty(),
    body("description", "Make sure that the description is entered correctly.")
      .not()
      .isEmpty(),
    body("location", "Make sure that the location is entered correctly.")
      .not()
      .isEmpty(),
    body(
      "date",
      "Make sure that the date is entered correctly (format: YYYY-MM-DD HH:MM)"
    ).matches(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/),
    // .isDate({
    //   format: "YYYY-MM-DD HH:MM",
    body("link", "Make sure that the link is entered correctly.")
      .not()
      .isEmpty(),
    body("tags", "Make sure that the tags are entered correctly")
      .not()
      .isEmpty(),
  ];
};
