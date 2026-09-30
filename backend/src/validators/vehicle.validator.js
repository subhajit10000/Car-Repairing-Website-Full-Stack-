import { body } from "express-validator";

const createVehicleValidator = [
  body("make").trim().notEmpty().withMessage("Vehicle make is required."),

  body("model").trim().notEmpty().withMessage("Vehicle model is required."),

  body("year")
    .optional()
    .isInt({ min: 1950, max: new Date().getFullYear() + 1 })
    .withMessage("Vehicle year is invalid."),

  body("regNumber")
    .trim()
    .notEmpty()
    .withMessage("Vehicle registration number is required."),

  body("color")
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage("Color must be under 30 characters."),

  body("notes")
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage("Notes must be under 300 characters."),
];

const updateVehicleValidator = [
  body("make")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Vehicle make cannot be empty."),

  body("model")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Vehicle model cannot be empty."),

  body("year")
    .optional()
    .isInt({ min: 1950, max: new Date().getFullYear() + 1 })
    .withMessage("Vehicle year is invalid."),

  body("regNumber")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Vehicle registration number cannot be empty."),

  body("color")
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage("Color must be under 30 characters."),

  body("notes")
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage("Notes must be under 300 characters."),
];

export { createVehicleValidator, updateVehicleValidator };
