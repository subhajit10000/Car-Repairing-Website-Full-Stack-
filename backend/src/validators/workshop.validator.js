import { body } from "express-validator";

const createWorkshopValidator = [
  body("name").trim().notEmpty().withMessage("Workshop name is required."),
  body("image").trim().notEmpty().withMessage("Workshop image is required."),
  body("location").trim().notEmpty().withMessage("Workshop location is required."),
  body("openingTime").trim().notEmpty().withMessage("Opening time is required."),
  body("closingTime").trim().notEmpty().withMessage("Closing time is required."),
  body("startingPrice")
    .isFloat({ min: 0 })
    .withMessage("startingPrice must be a positive number."),
];

const updateWorkshopValidator = [
  body("status").optional().isIn(["Open", "Closed"]).withMessage("Invalid status."),
  body("openingTime").optional().trim().notEmpty(),
  body("closingTime").optional().trim().notEmpty(),
  body("startingPrice").optional().isFloat({ min: 0 }),
  body("distance").optional().isFloat({ min: 0 }),
];

export { createWorkshopValidator, updateWorkshopValidator };
