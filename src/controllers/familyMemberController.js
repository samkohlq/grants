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

export const setCoupleAsMarried = async (req, res) => {
  await Promise.all([
    FamilyMember.update(
      {
        maritalStatus: "Married",
        spouseId: req.body.spouse2Id,
      },
      {
        where: { id: req.body.spouse1Id },
      }
    ),
    FamilyMember.update(
      {
        maritalStatus: "Married",
        spouseId: req.body.spouse1Id,
      },
      {
        where: { id: req.body.spouse2Id },
      }
    ),
  ]).catch((error) => {
    console.log(error);
  });
  res.send("updated spouse Ids and set marital statuses to 'Married'");
};

export const setParentsForChild = async (req, res) => {
  await FamilyMember.update(
    {
      parent1Id: req.body.parent1Id,
      parent2Id: req.body.parent2Id,
    },
    {
      where: { id: req.body.childId },
    }
  ).catch((error) => {
    console.log(error);
  });
  res.send("child's parent IDs set");
};
