import { body, validationResult } from "express-validator";

const familyMemberValidationRules = () => {
  const currentDate = new Date().toISOString();
  return [
    body("HouseholdId").isNumeric(),
    body("name").isLength({ min: 1, max: 120 }),
    body("gender").isIn(["Female", "Male"]),
    body("maritalStatus").isIn(["Single", "Married", "Divorced", "Widowed"]),
    body("spouseId").optional().isNumeric(),
    body("occupationType").isIn(["Unemployed", "Student", "Employed"]),
    body("annualIncome").isCurrency(),
    body("birthDate").isISO8601().isBefore(currentDate),
  ];
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push({ [err.param]: err.msg }));

  return res.status(422).json({
    errors: extractedErrors,
  });
};

module.exports = {
  familyMemberValidationRules,
  validate,
};
