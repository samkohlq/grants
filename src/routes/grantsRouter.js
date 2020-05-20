import express from "express";
import { retrieveEligibleHouseholds } from "../controllers/grantsController";

const router = express.Router();

// retrieve all households eligible for grants
router.get("/retrieveEligibleHouseholds", (req, res) =>
  retrieveEligibleHouseholds(req, res)
);

export default router;
