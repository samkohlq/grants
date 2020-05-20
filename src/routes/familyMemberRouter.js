import express from "express";
import {
  addFamilyMember,
  removeFamilyMemberFromHousehold,
  setCoupleAsMarried,
  setParentsForChild,
} from "../controllers/familyMemberController";
import {
  familyMemberValidationRules,
  validate,
} from "../validations/familyMemberValidator";

const router = express.Router();

router.post(
  "/addFamilyMember",
  familyMemberValidationRules(),
  validate,
  (req, res) => addFamilyMember(req, res)
);

router.put("/setCoupleAsMarried", (req, res) => setCoupleAsMarried(req, res));

router.put("/setParentsForChild", (req, res) => setParentsForChild(req, res));

router.put("/removeFamilyMemberFromHousehold", (req, res) =>
  removeFamilyMemberFromHousehold(req, res)
);

export default router;
