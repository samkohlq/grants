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

describe("addFamilyMember endpoint validates and adds a family member to household", () => {
  test("addFamilyMember endpoint adds new single family member", async () => {
    const createHouseholdResponse = await request(app)
      .post("/households/createHousehold")
      .send({ housingType: "Landed" })
      .set("Accept", "application/json");
    expect(createHouseholdResponse.statusCode).toBe(200);
    const addFamilyMemberResponse = await request(app)
      .post("/family-members/addFamilyMember")
      .send({
        HouseholdId: createHouseholdResponse.body.id,
        name: "FamilyMemberName",
        gender: "Female",
        maritalStatus: "Single",
        occupationType: "Unemployed",
        annualIncome: 100000,
        birthDate: new Date("2020-05-15 17:01:07.941+08"),
      })
      .set("Accept", "application/json");
    // assert that response contains the housingType of the new household
    expect(addFamilyMemberResponse.statusCode).toBe(200);
  });
  test("addFamilyMember endpoint validates against unrecognised marital status and does not add new family member", async () => {
    const createHouseholdResponse = await request(app)
      .post("/households/createHousehold")
      .send({ housingType: "Landed" })
      .set("Accept", "application/json");
    expect(createHouseholdResponse.statusCode).toBe(200);
    const addFamilyMemberResponse = await request(app)
      .post("/family-members/addFamilyMember")
      .send({
        HouseholdId: createHouseholdResponse.body.id,
        name: "FamilyMemberName",
        gender: "Female",
        maritalStatus: "In relationship with self",
        occupationType: "Unemployed",
        annualIncome: 100000,
        birthDate: new Date("2020-05-15 17:01:07.941+08"),
      })
      .set("Accept", "application/json");
    // assert that request did not pass validation
    expect(addFamilyMemberResponse.statusCode).toBe(422);
  });
});
