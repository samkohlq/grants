import { Household } from "../db/models";

export const createHousehold = async (req, res) => {
  const newHousehold = await Household.create({
    housingType: req.body.housingType,
  }).catch((error) => {
    console.log(error);
  });
  res.send(newHousehold);
};
