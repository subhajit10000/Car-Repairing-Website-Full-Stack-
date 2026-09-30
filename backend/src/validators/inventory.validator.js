import { body } from "express-validator";

const createInventoryItemValidator = [
  body("name").trim().notEmpty().withMessage("Item name is required."),
  body("quantity")
    .optional()
    .isInt({ min: 0 })
    .withMessage("quantity must be a non-negative integer."),
  body("unitCost").optional().isFloat({ min: 0 }),
  body("reorderLevel").optional().isInt({ min: 0 }),
];

const updateInventoryItemValidator = [
  body("name").optional().trim().notEmpty(),
  body("quantity").optional().isInt({ min: 0 }),
  body("unitCost").optional().isFloat({ min: 0 }),
  body("reorderLevel").optional().isInt({ min: 0 }),
];

export { createInventoryItemValidator, updateInventoryItemValidator };
