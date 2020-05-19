import Sequelize from "sequelize";
import { FamilyMember, Household, sequelize } from "../db/models";

const Op = Sequelize.Op;

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

export const retrieveEligibleHouseholds = async (req, res) => {
  let eligibleHouseholds = {
    studentEncouragementBonus: null,
    elderBonus: null,
    babySunshineGrant: null,
    yoloGstGrant: null,
  };
  const studentEncouragementBonus = await retrieveHouseholdsEligibleForStudentEncouragementBonus();
  const elderBonus = await retrieveHouseholdsEligibleForElderBonus();
  const babySunshineGrant = await retrieveHouseholdsEligibleForBabySunshineGrant();
  const yoloGstGrant = await retrieveHouseholdsEligibleForYoloGstGrant();

  eligibleHouseholds.studentEncouragementBonus = studentEncouragementBonus;
  eligibleHouseholds.elderBonus = elderBonus;
  eligibleHouseholds.babySunshineGrant = babySunshineGrant;
  eligibleHouseholds.yoloGstGrant = yoloGstGrant;

  res.send(eligibleHouseholds);
};

// search for households eligible for Student Encouragement Bonus
const retrieveHouseholdsEligibleForStudentEncouragementBonus = async () => {
  let sixteenYearsAgo = new Date();
  sixteenYearsAgo.setFullYear(sixteenYearsAgo.getFullYear() - 16);
  const lowIncomeHouseholds = await Household.findAll({
    attributes: { exclude: ["createdAt", "updatedAt"] },
    include: [
      {
        model: FamilyMember,
        attributes: [],
      },
    ],
    group: ["Household.id"],
    having: sequelize.where(
      sequelize.fn("sum", sequelize.col("FamilyMembers.annualIncome")),
      "<",
      150000
    ),
  }).catch((error) => {
    console.log(error);
  });
  // for each household, retrieve family members under younger than 16 years
  let studentEncouragementBonus = [];
  for (let i = 0; i < lowIncomeHouseholds.length; i++) {
    const HouseholdId = lowIncomeHouseholds[i].dataValues.id;
    const FamilyMembers = await FamilyMember.findAll({
      attributes: { exclude: ["createdAt", "updatedAt"] },
      where: {
        HouseholdId: HouseholdId,
        birthDate: { [Op.gt]: sixteenYearsAgo },
      },
    });
    // only add household if there are family members younger than 16 years
    if (FamilyMembers.length > 0) {
      studentEncouragementBonus.push({
        id: HouseholdId,
        housingType: lowIncomeHouseholds[i].dataValues.housingType,
        FamilyMembers,
      });
    }
  }
  return studentEncouragementBonus;
};

// search for households eligible for Elder Bonus
let retrieveHouseholdsEligibleForElderBonus = async () => {
  let fiftyYearsAgo = new Date();
  fiftyYearsAgo.setFullYear(fiftyYearsAgo.getFullYear() - 50);
  const householdsWithElderly = await Household.findAll({
    attributes: { exclude: ["createdAt", "updatedAt"] },
    include: [
      {
        model: FamilyMember,
        where: {
          birthDate: {
            [Op.lt]: fiftyYearsAgo,
          },
        },
      },
    ],
    where: { housingType: "HDB" },
  }).catch((error) => {
    console.log(error);
  });
  return householdsWithElderly;
};

// search for households eligible for Baby Sunshine Grant
let retrieveHouseholdsEligibleForBabySunshineGrant = async () => {
  let fiveYearsAgo = new Date();
  fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
  const householdsWithBabies = await Household.findAll({
    attributes: { exclude: ["createdAt", "updatedAt"] },
    include: [
      {
        model: FamilyMember,
        where: {
          birthDate: {
            [Op.gt]: fiveYearsAgo,
          },
        },
      },
    ],
  }).catch((error) => {
    console.log(error);
  });
  return householdsWithBabies;
};

// search for households eligible for YOLO GST Grant
let retrieveHouseholdsEligibleForYoloGstGrant = async () => {
  const lowIncomeHouseholds = await Household.findAll({
    attributes: { exclude: ["createdAt", "updatedAt"] },
    where: {
      housingType: "HDB",
    },
    include: [
      {
        model: FamilyMember,
        attributes: [],
      },
    ],
    group: ["Household.id"],
    having: sequelize.where(
      sequelize.fn("sum", sequelize.col("FamilyMembers.annualIncome")),
      "<",
      100000
    ),
  }).catch((error) => {
    console.log(error);
  });
  return lowIncomeHouseholds;
};
