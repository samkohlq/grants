import Sequelize from "sequelize";
import { FamilyMember, Household, sequelize } from "../db/models";

const Op = Sequelize.Op;

export const retrieveEligibleHouseholds = async (req, res) => {
  const filters = {
    householdSize: req.query.householdSize,
  };

  let eligibleHouseholds = {
    studentEncouragementBonus: null,
    familyTogethernessScheme: null,
    elderBonus: null,
    babySunshineGrant: null,
    yoloGstGrant: null,
  };

  const studentEncouragementBonus = await retrieveHouseholdsEligibleForStudentEncouragementBonus();
  const familyTogethernessScheme = await retrieveHouseholdsEligibleForFamilyTogethernessScheme();
  const elderBonus = await retrieveHouseholdsEligibleForElderBonus();
  const babySunshineGrant = await retrieveHouseholdsEligibleForBabySunshineGrant();
  const yoloGstGrant = await retrieveHouseholdsEligibleForYoloGstGrant();

  eligibleHouseholds.studentEncouragementBonus = await filterArray(
    studentEncouragementBonus,
    filters
  );
  eligibleHouseholds.familyTogethernessScheme = await filterArray(
    familyTogethernessScheme,
    filters
  );
  eligibleHouseholds.elderBonus = await filterArray(elderBonus, filters);
  eligibleHouseholds.babySunshineGrant = await filterArray(
    babySunshineGrant,
    filters
  );
  eligibleHouseholds.yoloGstGrant = await filterArray(yoloGstGrant, filters);

  res.send(eligibleHouseholds);
};

const filterArray = async (householdArray, filters) => {
  let filteredHouseholds = [];
  if (!filters.householdSize && !filters.combinedHouseholdIncome) {
    return householdArray;
  } else {
    if (filters.householdSize) {
      // go through households and check for each household's size
      for (let household of householdArray) {
        const HouseholdId = household.id;
        const familyMembers = await FamilyMember.findAll({
          where: { HouseholdId: HouseholdId },
        });
        if (familyMembers.length == filters.householdSize) {
          filteredHouseholds.push(household);
        }
      }
    }
    return filteredHouseholds;
  }
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
  for (let household of lowIncomeHouseholds) {
    const HouseholdId = household.id;
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
        housingType: household.housingType,
        FamilyMembers,
      });
    }
  }
  return studentEncouragementBonus;
};

// search for households eligible for Family Togetherness Scheme
let retrieveHouseholdsEligibleForFamilyTogethernessScheme = async () => {
  let eighteenYearsAgo = new Date();
  eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
  const householdsWithChildrenBelowEighteen = await Household.findAll({
    attributes: { exclude: ["createdAt", "updatedAt"] },
    include: [
      {
        model: FamilyMember,
        attributes: { exclude: ["createdAt", "updatedAt"] },
        where: {
          [Op.and]: [
            {
              parent1Id: {
                [Op.ne]: null,
              },
            },
            {
              parent2Id: {
                [Op.ne]: null,
              },
            },
            {
              birthDate: {
                [Op.gt]: eighteenYearsAgo,
              },
            },
          ],
        },
      },
    ],
  }).catch((error) => {
    console.log(error);
  });

  let familyTogethernessScheme = [];
  // for every household that has children below eighteen
  for (let household of householdsWithChildrenBelowEighteen) {
    let parents = [];
    const FamilyMembers = [];
    const HouseholdId = household.id;
    // for each child with parents
    for (let familyMember of household.FamilyMembers) {
      // find child's parent IDs and add them to parents array
      const parent1Id = familyMember.parent1Id;
      const parent2Id = familyMember.parent2Id;

      // check if parents are married to each other
      const parent1 = await FamilyMember.findOne({
        where: {
          id: parent1Id,
        },
      });
      const parent2 = await FamilyMember.findOne({
        where: {
          id: parent2Id,
        },
      });

      if (parent1.spouseId == parent2.id && parent2.spouseId == parent1.id) {
        // add child to FamilyMembers array if parents live in same household
        FamilyMembers.push(familyMember);
        parents.push(parent1Id);
        parents.push(parent2Id);
      }
    }

    // get distinct set of parent IDs
    const distinctParents = [...new Set(parents)];

    // add each distinct parent to FamilyMembers array
    for (let parentId in distinctParents) {
      const retrievedParent = await FamilyMember.findOne({
        attributes: { exclude: ["createdAt", "updatedAt"] },
        where: {
          id: parentId,
        },
      });
      FamilyMembers.push(retrievedParent);
    }

    // only add household if there are family members younger than 16 years
    if (FamilyMembers.length > 0) {
      familyTogethernessScheme.push({
        id: HouseholdId,
        housingType: household.housingType,
        FamilyMembers,
      });
    }
  }
  return familyTogethernessScheme;
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
