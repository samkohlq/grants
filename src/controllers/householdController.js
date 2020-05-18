import { FamilyMember, Household } from "../db/models";

export const createHousehold = async (req, res) => {
  const newHousehold = await Household.create({
    housingType: req.body.housingType,
  }).catch((error) => {
    console.log(error);
  });
  res.send(newHousehold);
};

export const retrieveAllHouseholds = async (req, res) => {
  const allHouseholds = await Household.findAll({
    include: [
      {
        model: FamilyMember,
      },
    ],
  }).catch((error) => {
    console.log(error);
  });
  res.send(allHouseholds);
};

export const retrieveHousehold = async (req, res) => {
  const retrievedHousehold = await Household.findOne({
    where: { id: req.query.id },
    include: [{ model: FamilyMember }],
  }).catch((error) => {
    console.log(error);
  });
  res.send(retrievedHousehold);
};
