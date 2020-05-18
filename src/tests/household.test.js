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
    const householdAFamilyMember1 = await request(app)
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
    const householdAFamilyMember2 = await request(app)
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
    const householdBFamilyMember1 = await request(app)
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
    const householdBFamilyMember2 = await request(app)
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
    const householdBFamilyMember3 = await request(app)
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

    // assert that householdA contains two family members
    expect(retrieveAllHouseholdsResponse.statusCode).toBe(200);
    expect(retrieveAllHouseholdsResponse.body[0].FamilyMembers.length).toBe(2);
    expect(retrieveAllHouseholdsResponse.body[0].FamilyMembers[0].name).toBe(
      householdAFamilyMember1.body.name
    );
    expect(retrieveAllHouseholdsResponse.body[0].FamilyMembers[1].name).toBe(
      householdAFamilyMember2.body.name
    );

    // assert that householdA contains three family members
    expect(retrieveAllHouseholdsResponse.body[1].FamilyMembers.length).toBe(3);
    expect(retrieveAllHouseholdsResponse.body[1].FamilyMembers[0].name).toBe(
      householdBFamilyMember1.body.name
    );
    expect(retrieveAllHouseholdsResponse.body[1].FamilyMembers[1].name).toBe(
      householdBFamilyMember2.body.name
    );
    expect(retrieveAllHouseholdsResponse.body[1].FamilyMembers[2].name).toBe(
      householdBFamilyMember3.body.name
    );
  });
});
