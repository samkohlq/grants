import express from "express";
import { createHousehold } from "../controllers/householdController";
import {
  householdValidationRules,
  validate,
} from "../validations/householdValidator";

const router = express.Router();

// create household
router.post(
  "/createHousehold",
  householdValidationRules(),
  validate,
  (req, res) => createHousehold(req, res)
);

export default router;
