import { body } from "express-validator";

const createAppointmentValidator = [
  body("workshopId")
    .notEmpty()
    .withMessage("workshopId is required.")
    .bail()
    .isMongoId()
    .withMessage("workshopId must be a valid id."),

  body("serviceIds")
    .isArray({ min: 1 })
    .withMessage("At least one serviceId is required."),

  body("serviceIds.*")
    .isMongoId()
    .withMessage("Each serviceId must be a valid id."),

  body("vehicle.make")
    .trim()
    .notEmpty()
    .withMessage("Vehicle make is required."),

  body("vehicle.model")
    .trim()
    .notEmpty()
    .withMessage("Vehicle model is required."),

  body("vehicle.year")
    .optional()
    .isInt({ min: 1980, max: new Date().getFullYear() })
    .withMessage("Vehicle year is invalid."),

  body("vehicle.regNumber")
    .trim()
    .notEmpty()
    .withMessage("Vehicle registration number is required."),

  body("appointmentDate")
    .notEmpty()
    .withMessage("appointmentDate is required.")
    .bail()
    .isISO8601()
    .withMessage("appointmentDate must be a valid date.")
    .bail()
    .custom((value) => {
      const inputDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (inputDate < today) {
        throw new Error("appointmentDate cannot be in the past.");
      }
      return true;
    }),

  body("timeSlot")
    .trim()
    .notEmpty()
    .withMessage("timeSlot is required."),

  body("contactPhone")
    .trim()
    .notEmpty()
    .withMessage("contactPhone is required.")
    .bail()
    .isMobilePhone("any")
    .withMessage("Invalid contact phone number."),

  body("notes")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("notes must be under 500 characters."),
];


const updateStatusValidator = [
  body("status")
    .trim()
    .notEmpty()
    .withMessage("status is required.")
    .bail()
    .isIn(["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"])
    .withMessage("Invalid status value."),

  body("note")
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage("note must be under 300 characters."),

  body("finalCost")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("finalCost must be a positive number."),
];

export { createAppointmentValidator, updateStatusValidator };
