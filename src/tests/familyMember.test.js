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
    await expect(createHouseholdResponse.statusCode).toBe(200);
    const HouseholdId = createHouseholdResponse.body.id;
    const addFamilyMemberResponse = await request(app)
      .post("/family-members/addFamilyMember")
      .send({
        HouseholdId: HouseholdId,
        name: "FamilyMemberName",
        gender: "Female",
        maritalStatus: "Single",
        occupationType: "Unemployed",
        annualIncome: 100000,
        birthDate: new Date("2020-05-15").toISOString(),
      })
      .set("Accept", "application/json");
    // assert that response contains the housingType of the new household
    expect(addFamilyMemberResponse.body.HouseholdId).toBe(HouseholdId);
    expect(addFamilyMemberResponse.body.name).toBe("FamilyMemberName");
    expect(addFamilyMemberResponse.body.gender).toBe("Female");
    expect(addFamilyMemberResponse.body.maritalStatus).toBe("Single");
    expect(addFamilyMemberResponse.body.spouseId).toBe(null);
    expect(addFamilyMemberResponse.body.occupationType).toBe("Unemployed");
    expect(addFamilyMemberResponse.body.annualIncome).toBe(100000);
    expect(addFamilyMemberResponse.body.birthDate).toBe(
      "2020-05-15T00:00:00.000Z"
    );
    expect(addFamilyMemberResponse.statusCode).toBe(200);
  });
  test("addFamilyMember endpoint validates against unrecognised marital status and does not add new family member", async () => {
    const createHouseholdResponse = await request(app)
      .post("/households/createHousehold")
      .send({ housingType: "Landed" })
      .set("Accept", "application/json");
    await expect(createHouseholdResponse.statusCode).toBe(200);
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

describe("setCoupleAsMarried endpoint sets spouseIds and maritalStatuses", () => {
  test("marital statuses are 'Married', spouse1's spouseId is spouse2 and vice versa", async () => {
    const createHouseholdResponse = await request(app)
      .post("/households/createHousehold")
      .send({ housingType: "Landed" })
      .set("Accept", "application/json");
    await expect(createHouseholdResponse.statusCode).toBe(200);
    const HouseholdId = createHouseholdResponse.body.id;
    // add married couple as family members
    const FamilyMember1 = await request(app)
      .post("/family-members/addFamilyMember")
      .send({
        HouseholdId: HouseholdId,
        name: "FamilyMember1",
        gender: "Female",
        maritalStatus: "Single",
        occupationType: "Employed",
        annualIncome: 50000,
        birthDate: new Date("1980-05-15").toISOString(),
      })
      .set("Accept", "application/json");
    const FamilyMember2 = await request(app)
      .post("/family-members/addFamilyMember")
      .send({
        HouseholdId: HouseholdId,
        name: "FamilyMember2",
        gender: "Male",
        maritalStatus: "Single",
        occupationType: "Employed",
        annualIncome: 50000,
        birthDate: new Date("1984-05-15").toISOString(),
      })
      .set("Accept", "application/json");
    // set marital statuses and spouseIds
    const setCoupleAsMarriedResponse = await request(app)
      .put("/family-members/setCoupleAsMarried")
      .send({ spouse1Id: FamilyMember1.id, spouse2Id: FamilyMember2.id });

    // retrieve Household and its family members
    const retrieveHouseholdResponse = await request(app)
      .get("/households/retrieveHousehold")
      .query({ id: HouseholdId })
      .set("Accept", "application/json");

    // assert that married couple have each other's IDs as spouseIds
    expect(setCoupleAsMarriedResponse.statusCode).toBe(200);
    expect(retrieveHouseholdResponse.statusCode).toBe(200);
  });
});
