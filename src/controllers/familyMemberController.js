import { FamilyMember, Household } from "../db/models";

export const addFamilyMember = async (req, res) => {
  const [newFamilyMember, associatedHousehold] = await Promise.all([
    FamilyMember.create({
      name: req.body.name,
      gender: req.body.gender,
      maritalStatus: req.body.maritalStatus,
      spouseId: req.body.spouseId,
      occupationType: req.body.occupationType,
      annualIncome: req.body.annualIncome,
      birthDate: req.body.birthDate,
    }),
    Household.findByPk(req.body.HouseholdId),
  ]);
  await newFamilyMember.setHousehold(associatedHousehold);
  res.send(newFamilyMember);
};
