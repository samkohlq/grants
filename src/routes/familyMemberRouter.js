import express from "express";
import {
  addFamilyMember,
  setCoupleAsMarried,
} from "../controllers/familyMemberController";
import {
  familyMemberValidationRules,
  validate,
} from "../validations/familyMemberValidator";

const router = express.Router();

// add family member to household
router.post(
  "/addFamilyMember",
  familyMemberValidationRules(),
  validate,
  (req, res) => addFamilyMember(req, res)
);

router.put("/setCoupleAsMarried", (req, res) => setCoupleAsMarried(req, res));

export default router;
