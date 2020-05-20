import request from "supertest";
import app from "../app";
import models from "../db/models";

afterEach(async () => {
  // clean up database after each test is done
  await models.Household.destroy({ where: {} });
  await models.FamilyMember.destroy({ where: {} });
});

afterAll(() => {
  // close sequelize connection when all tests are done
  models.sequelize.close();
});

describe("retrieveEligibleHouseholds retrieves households and family members eligible for Student Encouragement Bonus", () => {
  test("retrieves households with annual income below $150,000 and family members below age 16", async () => {
    // create household A
    const householdA = await request(app)
      .post("/households/createHousehold")
      .send({ housingType: "HDB" })
      .set("Accept", "application/json");
    const HouseholdAId = householdA.body.id;
    // add a child under 16 to Household A
    await request(app)
      .post("/family-members/addFamilyMember")
      .send({
        HouseholdId: HouseholdAId,
        name: "FamilyMemberUnderSixteen",
        gender: "Female",
        maritalStatus: "Single",
        occupationType: "Student",
        annualIncome: 0,
        birthDate: new Date("2020-05-15").toISOString(),
      })
      .set("Accept", "application/json");
    // add an adult with low income, above 16 to Household A
    await request(app)
      .post("/family-members/addFamilyMember")
      .send({
        HouseholdId: HouseholdAId,
        name: "FamilyMemberAboveSixteen",
        gender: "Male",
        maritalStatus: "Divorced",
        occupationType: "Employed",
        annualIncome: 50000,
        birthDate: new Date("1977-05-15").toISOString(),
      })
      .set("Accept", "application/json");

    // create household B
    const householdB = await request(app)
      .post("/households/createHousehold")
      .send({ housingType: "Condominium" })
      .set("Accept", "application/json");
    const HouseholdBId = householdB.body.id;
    // add a child under 16 to Household B
    await request(app)
      .post("/family-members/addFamilyMember")
      .send({
        HouseholdId: HouseholdBId,
        name: "FamilyMemberUnderSixteen",
        gender: "Female",
        maritalStatus: "Single",
        occupationType: "Student",
        annualIncome: 0,
        birthDate: new Date("2020-05-15").toISOString(),
      })
      .set("Accept", "application/json");
    // add an adult with high income, above 16 to Household B
    await request(app)
      .post("/family-members/addFamilyMember")
      .send({
        HouseholdId: HouseholdBId,
        name: "FamilyMemberAboveSixteen",
        gender: "Male",
        maritalStatus: "Divorced",
        occupationType: "Employed",
        annualIncome: 200000,
        birthDate: new Date("1977-05-15").toISOString(),
      })
      .set("Accept", "application/json");

    const response = await request(app)
      .get("/grants/retrieveEligibleHouseholds")
      .set("Accept", "application/json");

    // assert that response only contains the low income household
    expect(response.statusCode).toBe(200);
    expect(response.body.studentEncouragementBonus.length).toBe(1);
    expect(response.body.studentEncouragementBonus[0].housingType).toBe("HDB");
    expect(
      response.body.studentEncouragementBonus[0].FamilyMembers.length
    ).toBe(1);
    expect(
      response.body.studentEncouragementBonus[0].FamilyMembers[0].name
    ).toBe("FamilyMemberUnderSixteen");
  });
});

describe("retrieveEligibleHouseholds endpoint retrieves households eligible for Family Togetherness Scheme", () => {
  test("only retrieves parents who are still married and living in same household", async () => {
    // create household
    const household = await request(app)
      .post("/households/createHousehold")
      .send({ housingType: "Landed" })
      .set("Accept", "application/json");
    const HouseholdId = household.body.id;
    // add parents and children to household
    const parent1 = await request(app)
      .post("/family-members/addFamilyMember")
      .send({
        HouseholdId: HouseholdId,
        name: "Parent1",
        gender: "Female",
        maritalStatus: "Single",
        occupationType: "Employed",
        annualIncome: 100000,
        birthDate: new Date("1980-05-15").toISOString(),
      })
      .set("Accept", "application/json");
    const parent2 = await request(app)
      .post("/family-members/addFamilyMember")
      .send({
        HouseholdId: HouseholdId,
        name: "Parent2",
        gender: "Male",
        maritalStatus: "Single",
        occupationType: "Unemployed",
        annualIncome: 0,
        birthDate: new Date("1980-05-15").toISOString(),
      })
      .set("Accept", "application/json");
    const child = await request(app)
      .post("/family-members/addFamilyMember")
      .send({
        HouseholdId: HouseholdId,
        name: "Child",
        gender: "Male",
        maritalStatus: "Single",
        occupationType: "Unemployed",
        annualIncome: 0,
        birthDate: new Date("2020-05-15").toISOString(),
      })
      .set("Accept", "application/json");

    // set parents 1 and 2 to married
    await request(app)
      .put("/family-members/setCoupleAsMarried")
      .send({
        spouse1Id: parent1.body.id,
        spouse2Id: parent2.body.id,
      })
      .set("Accept", "application/json");

    // set parents 1 and 2 for child
    await request(app).put("/family-members/setParentsForChild").send({
      parent1Id: parent1.body.id,
      parent2Id: parent2.body.id,
      childId: child.body.id,
    });

    // check for eligible households
    const response = await request(app)
      .get("/grants/retrieveEligibleHouseholds")
      .set("Accept", "application/json");

    // assert that response contains three family members
    expect(response.statusCode).toBe(200);
    expect(response.body.familyTogethernessScheme.length).toBe(1);
    expect(response.body.familyTogethernessScheme[0].FamilyMembers.length).toBe(
      3
    );
  });

  test("does not retrieve parents who are not married, even if living in same household", async () => {
    // create household
    const household = await request(app)
      .post("/households/createHousehold")
      .send({ housingType: "Landed" })
      .set("Accept", "application/json");
    const HouseholdId = household.body.id;
    // add parents and children to household
    const parent1 = await request(app)
      .post("/family-members/addFamilyMember")
      .send({
        HouseholdId: HouseholdId,
        name: "Parent1",
        gender: "Female",
        maritalStatus: "Single",
        occupationType: "Employed",
        annualIncome: 100000,
        birthDate: new Date("1980-05-15").toISOString(),
      })
      .set("Accept", "application/json");
    const parent2 = await request(app)
      .post("/family-members/addFamilyMember")
      .send({
        HouseholdId: HouseholdId,
        name: "Parent2",
        gender: "Male",
        maritalStatus: "Single",
        occupationType: "Unemployed",
        annualIncome: 0,
        birthDate: new Date("1980-05-15").toISOString(),
      })
      .set("Accept", "application/json");
    const child = await request(app)
      .post("/family-members/addFamilyMember")
      .send({
        HouseholdId: HouseholdId,
        name: "Child",
        gender: "Male",
        maritalStatus: "Single",
        occupationType: "Unemployed",
        annualIncome: 0,
        birthDate: new Date("2020-05-15").toISOString(),
      })
      .set("Accept", "application/json");

    // set parents 1 and 2 for child
    await request(app).put("/family-members/setParentsForChild").send({
      parent1Id: parent1.body.id,
      parent2Id: parent2.body.id,
      childId: child.body.id,
    });

    // check for eligible households
    const response = await request(app)
      .get("/grants/retrieveEligibleHouseholds")
      .set("Accept", "application/json");

    // assert that response contains three family members
    expect(response.statusCode).toBe(200);
    expect(response.body.familyTogethernessScheme.length).toBe(0);
  });
});

describe("retrieveEligibleHouseholds endpoint retrieves households and family members that are eligible for Elder Bonus", () => {
  test("only retrieves family members above 50", async () => {
    // create household A
    const householdA = await request(app)
      .post("/households/createHousehold")
      .send({ housingType: "HDB" })
      .set("Accept", "application/json");
    const HouseholdAId = householdA.body.id;
    // add elderly above 50 to Household A
    await request(app)
      .post("/family-members/addFamilyMember")
      .send({
        HouseholdId: HouseholdAId,
        name: "FamilyMemberAboveFifty",
        gender: "Female",
        maritalStatus: "Single",
        occupationType: "Unemployed",
        annualIncome: 0,
        birthDate: new Date("1950-05-15").toISOString(),
      })
      .set("Accept", "application/json");
    // add adult below 50 to Household A
    await request(app)
      .post("/family-members/addFamilyMember")
      .send({
        HouseholdId: HouseholdAId,
        name: "FamilyMemberBelowFifty",
        gender: "Male",
        maritalStatus: "Divorced",
        occupationType: "Employed",
        annualIncome: 50000,
        birthDate: new Date("1977-05-15").toISOString(),
      })
      .set("Accept", "application/json");

    const response = await request(app)
      .get("/grants/retrieveEligibleHouseholds")
      .set("Accept", "application/json");
    // assert that response contains the housingType of the new household
    expect(response.statusCode).toBe(200);
    expect(response.body.elderBonus[0].FamilyMembers.length).toBe(1);
    expect(response.body.elderBonus[0].FamilyMembers[0].name).toBe(
      "FamilyMemberAboveFifty"
    );
  });

  test("does not retrieve if housingType is not HDB, even if there are family members above 50", async () => {
    // create household A
    const householdA = await request(app)
      .post("/households/createHousehold")
      .send({ housingType: "Condominium" })
      .set("Accept", "application/json");
    const HouseholdAId = householdA.body.id;
    // add elderly above 50 to Household A
    await request(app)
      .post("/family-members/addFamilyMember")
      .send({
        HouseholdId: HouseholdAId,
        name: "FamilyMemberAboveFifty",
        gender: "Female",
        maritalStatus: "Single",
        occupationType: "Unemployed",
        annualIncome: 0,
        birthDate: new Date("1950-05-15").toISOString(),
      })
      .set("Accept", "application/json");
    const response = await request(app)
      .get("/grants/retrieveEligibleHouseholds")
      .set("Accept", "application/json");
    // assert that response contains the housingType of the new household
    expect(response.statusCode).toBe(200);
    expect(response.body.elderBonus.length).toBe(0);
  });
});

describe("retrieveEligibleHouseholds endpoint retrieves households and family members that are eligible for Baby Sunshine Grant", () => {
  test("only retrieves family members younger than 5", async () => {
    // create household
    const household = await request(app)
      .post("/households/createHousehold")
      .send({ housingType: "Landed" })
      .set("Accept", "application/json");
    const HouseholdId = household.body.id;
    // add baby younger than 5 to Household
    await request(app)
      .post("/family-members/addFamilyMember")
      .send({
        HouseholdId: HouseholdId,
        name: "FamilyMemberBelowFive",
        gender: "Female",
        maritalStatus: "Single",
        occupationType: "Unemployed",
        annualIncome: 0,
        birthDate: new Date("2020-05-15").toISOString(),
      })
      .set("Accept", "application/json");
    // add adult above 5 to Household
    await request(app)
      .post("/family-members/addFamilyMember")
      .send({
        HouseholdId: HouseholdId,
        name: "FamilyMemberAboveFive",
        gender: "Male",
        maritalStatus: "Single",
        occupationType: "Employed",
        annualIncome: 50000,
        birthDate: new Date("1977-05-15").toISOString(),
      })
      .set("Accept", "application/json");

    const response = await request(app)
      .get("/grants/retrieveEligibleHouseholds")
      .set("Accept", "application/json");
    // assert that response contains the housingType of the new household
    expect(response.statusCode).toBe(200);
    expect(response.body.babySunshineGrant[0].FamilyMembers.length).toBe(1);
    expect(response.body.babySunshineGrant[0].FamilyMembers[0].name).toBe(
      "FamilyMemberBelowFive"
    );
  });
});

describe("retrieveEligibleHouseholds endpoint retrieves households eligible for YOLO GST Grant", () => {
  test("only retrieves HDB households", async () => {
    // create household
    const household = await request(app)
      .post("/households/createHousehold")
      .send({ housingType: "Landed" })
      .set("Accept", "application/json");
    const HouseholdId = household.body.id;
    // add unemployed adult to Household
    await request(app)
      .post("/family-members/addFamilyMember")
      .send({
        HouseholdId: HouseholdId,
        name: "FamilyMember",
        gender: "Female",
        maritalStatus: "Single",
        occupationType: "Unemployed",
        annualIncome: 0,
        birthDate: new Date("1980-05-15").toISOString(),
      })
      .set("Accept", "application/json");

    const response = await request(app)
      .get("/grants/retrieveEligibleHouseholds")
      .set("Accept", "application/json");
    // assert that response contains the housingType of the new household
    expect(response.statusCode).toBe(200);
    expect(response.body.yoloGstGrant.length).toBe(0);
  });

  test("only retrieves households if combined household income is below $100,000", async () => {
    // create household
    const household = await request(app)
      .post("/households/createHousehold")
      .send({ housingType: "HDB" })
      .set("Accept", "application/json");
    const HouseholdId = household.body.id;
    // add unemployed adult to Household
    await request(app)
      .post("/family-members/addFamilyMember")
      .send({
        HouseholdId: HouseholdId,
        name: "FamilyMember",
        gender: "Female",
        maritalStatus: "Single",
        occupationType: "Employed",
        annualIncome: 100000,
        birthDate: new Date("1980-05-15").toISOString(),
      })
      .set("Accept", "application/json");

    const response = await request(app)
      .get("/grants/retrieveEligibleHouseholds")
      .set("Accept", "application/json");
    // assert that response contains the housingType of the new household
    expect(response.statusCode).toBe(200);
    expect(response.body.yoloGstGrant.length).toBe(0);
  });
});
