import { body } from "express-validator";

const createServiceValidator = [
  body("name").trim().notEmpty().withMessage("Service name is required."),
  body("category").trim().notEmpty().withMessage("Service category is required."),
  body("description").trim().notEmpty().withMessage("Service description is required."),
  body("startingPrice")
    .isFloat({ min: 0 })
    .withMessage("startingPrice must be a positive number."),
  body("estimatedTime").trim().notEmpty().withMessage("estimatedTime is required."),
  body("icon").optional().trim(),
  body("includes").optional().isArray(),
  body("availableAt").optional().isArray(),
];

const updateServiceValidator = [
  body("name").optional().trim().notEmpty(),
  body("category").optional().trim().notEmpty(),
  body("description").optional().trim().notEmpty(),
  body("startingPrice").optional().isFloat({ min: 0 }),
  body("estimatedTime").optional().trim().notEmpty(),
  body("isActive").optional().isBoolean(),
  body("includes").optional().isArray(),
];

export { createServiceValidator, updateServiceValidator };
