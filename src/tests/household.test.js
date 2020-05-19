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

describe("createHousehold endpoint validates and creates a household", () => {
  test("createHousehold endpoint creates new household with housingType 'Landed'", async () => {
    const response = await request(app)
      .post("/households/createHousehold")
      .send({ housingType: "Landed" })
      .set("Accept", "application/json");
    // assert that response contains the housingType of the new household
    expect(response.statusCode).toBe(200);
    expect(response.body.housingType).toBe("Landed");
  });
  test("createHousehold endpoint validates against unrecognised housingType and does not create new household", async () => {
    const response = await request(app)
      .post("/households/createHousehold")
      .send({ housingType: "Underground" })
      .set("Accept", "application/json");
    // assert that request was validated against
    expect(response.statusCode).toBe(422);
  });
});

describe("retrieveAllHouseholds endpoint retrieves all households and their respective family members", () => {
  test("retrieveAllHouseholds endpoint returns an empty array if there are no households", async () => {
    const response = await request(app)
      .get("/households/retrieveAllHouseholds")
      .set("Accept", "application/json");
    // assert that response contains an empty array
    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject([]);
  });
  test("retrieveAllHouseholds endpoint returns an array of households and within each, an array of family members", async () => {
    // create household A
    const householdA = await request(app)
      .post("/households/createHousehold")
      .send({ housingType: "HDB" })
      .set("Accept", "application/json");
    const HouseholdAId = householdA.body.id;
    // create family members for household A
    await request(app)
      .post("/family-members/addFamilyMember")
      .send({
        HouseholdId: HouseholdAId,
        name: "FamilyMember1Name",
        gender: "Female",
        maritalStatus: "Single",
        occupationType: "Student",
        annualIncome: 0,
        birthDate: new Date("2020-05-15").toISOString(),
      })
      .set("Accept", "application/json");
    await request(app)
      .post("/family-members/addFamilyMember")
      .send({
        HouseholdId: HouseholdAId,
        name: "FamilyMember2Name",
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
      .send({ housingType: "Landed" })
      .set("Accept", "application/json");
    const HouseholdBId = householdB.body.id;
    // create family members for household B
    await request(app)
      .post("/family-members/addFamilyMember")
      .send({
        HouseholdId: HouseholdBId,
        name: "FamilyMember1Name",
        gender: "Female",
        maritalStatus: "Single",
        occupationType: "Employed",
        annualIncome: 1000000,
        birthDate: new Date("1980-05-15").toISOString(),
      })
      .set("Accept", "application/json");
    await request(app)
      .post("/family-members/addFamilyMember")
      .send({
        HouseholdId: HouseholdBId,
        name: "FamilyMember2Name",
        gender: "Female",
        maritalStatus: "Widowed",
        occupationType: "Unemployed",
        annualIncome: 0,
        birthDate: new Date("1934-05-15").toISOString(),
      })
      .set("Accept", "application/json");
    await request(app)
      .post("/family-members/addFamilyMember")
      .send({
        HouseholdId: HouseholdBId,
        name: "FamilyMember3Name",
        gender: "Male",
        maritalStatus: "Single",
        occupationType: "Unemployed",
        annualIncome: 0,
        birthDate: new Date("2009-05-15").toISOString(),
      })
      .set("Accept", "application/json");

    // retrieve all households
    const retrieveAllHouseholdsResponse = await request(app)
      .get("/households/retrieveAllHouseholds")
      .set("Accept", "application/json");

    expect(retrieveAllHouseholdsResponse.statusCode).toBe(200);
    expect(retrieveAllHouseholdsResponse.body.length).toBe(2);
  });
});

describe("retrieveHousehold endpoint retrieves one household and all its family members", () => {
  test("retrieveHousehold endpoint returns response with an empty object if there is no such household", async () => {
    const response = await request(app)
      .get("/households/retrieveHousehold")
      .query({ id: 1 })
      .set("Accept", "application/json");
    // assert that response body has an empty object
    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({});
  });
  test("retrieveHousehold endpoint returns a household and its family members", async () => {
    // create household
    const household = await request(app)
      .post("/households/createHousehold")
      .send({ housingType: "Landed" })
      .set("Accept", "application/json");
    const HouseholdId = household.body.id;
    // create family members for household A
    await request(app)
      .post("/family-members/addFamilyMember")
      .send({
        HouseholdId: HouseholdId,
        name: "FamilyMember1Name",
        gender: "Female",
        maritalStatus: "Single",
        occupationType: "Student",
        annualIncome: 0,
        birthDate: new Date("2020-05-15").toISOString(),
      })
      .set("Accept", "application/json");
    await request(app)
      .post("/family-members/addFamilyMember")
      .send({
        HouseholdId: HouseholdId,
        name: "FamilyMember2Name",
        gender: "Male",
        maritalStatus: "Divorced",
        occupationType: "Employed",
        annualIncome: 50000,
        birthDate: new Date("1977-05-15").toISOString(),
      })
      .set("Accept", "application/json");

    // retrieve household
    const retrieveHouseholdResponse = await request(app)
      .get("/households/retrieveHousehold")
      .query({ id: HouseholdId })
      .set("Accept", "application/json");

    // assert that household contains two family members
    expect(retrieveHouseholdResponse.statusCode).toBe(200);
    expect(retrieveHouseholdResponse.body.FamilyMembers.length).toBe(2);
  });
});

describe("retrieveEligibleHouseholds endpoint retrieves households and family members that are eligible for Student Encouragement Bonus", () => {
  test("only retrieves households and family members eligible for Student Encouragement Bonus", async () => {
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
    // add a child above 16 to Household A
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

    const response = await request(app)
      .get("/households/retrieveEligibleHouseholds")
      .set("Accept", "application/json");
    // assert that response contains the housingType of the new household
    expect(response.statusCode).toBe(200);
    expect(
      response.body.studentEncouragementBonus[0].FamilyMembers.length
    ).toBe(1);
    expect(
      response.body.studentEncouragementBonus[0].FamilyMembers[0].name
    ).toBe("FamilyMemberUnderSixteen");
  });
});

describe("retrieveEligibleHouseholds endpoint retrieves households and family members that are eligible for Elder Bonus", () => {
  test("if housingType is HDB, only retrieves family members above 50", async () => {
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
      .get("/households/retrieveEligibleHouseholds")
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
      .get("/households/retrieveEligibleHouseholds")
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
      .get("/households/retrieveEligibleHouseholds")
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
      .get("/households/retrieveEligibleHouseholds")
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
        annualIncome: 99999,
        birthDate: new Date("1980-05-15").toISOString(),
      })
      .set("Accept", "application/json");

    const response = await request(app)
      .get("/households/retrieveEligibleHouseholds")
      .set("Accept", "application/json");
    // assert that response contains the housingType of the new household
    expect(response.statusCode).toBe(200);
    expect(response.body.yoloGstGrant.length).toBe(1);
  });
});
