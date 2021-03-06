import request from "supertest";
import app from "../app";
import models from "../db/models";

afterEach(async () => {
  // clean up database after each test is done
  await models.Household.destroy({ where: {}, force: true });
  await models.FamilyMember.destroy({ where: {}, force: true });
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
    // create family members for household
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

describe("deleteHousehold endpoint soft deletes all family members and the household they belong to", () => {
  test("retrieveHouseholds returns empty after household has been soft deleted", async () => {
    const household = await request(app)
      .post("/households/createHousehold")
      .send({ housingType: "Landed" })
      .set("Accept", "application/json");
    const HouseholdId = household.body.id;
    // create family members for household
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

    await request(app)
      .delete("/households/deleteHousehold")
      .send({
        HouseholdId: HouseholdId,
      })
      .set("Accept", "application/json");

    // retrieve household
    const retrieveHouseholdResponse = await request(app)
      .get("/households/retrieveAllHouseholds")
      .set("Accept", "application/json");

    // assert that household contains two family members
    expect(retrieveHouseholdResponse.statusCode).toBe(200);
    expect(retrieveHouseholdResponse.body.length).toBe(0);
  });
});
