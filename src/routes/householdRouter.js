import express from "express";
import {
  createHousehold,
  retrieveAllHouseholds,
  retrieveHousehold,
} from "../controllers/householdController";
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

// retrieve all households
router.get("/retrieveAllHouseholds", (req, res) =>
  retrieveAllHouseholds(req, res)
);

// retrieve a household by id
router.get("/retrieveHousehold", (req, res) => retrieveHousehold(req, res));

export default router;
