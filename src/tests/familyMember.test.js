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
      .send({
        spouse1Id: FamilyMember1.body.id,
        spouse2Id: FamilyMember2.body.id,
      });

    // retrieve Household and its family members
    const retrieveHouseholdResponse = await request(app)
      .get("/households/retrieveHousehold")
      .query({ id: HouseholdId })
      .set("Accept", "application/json");

    // assert that married couple have each other's IDs as spouseIds
    expect(setCoupleAsMarriedResponse.statusCode).toBe(200);
    expect(retrieveHouseholdResponse.statusCode).toBe(200);
    expect(retrieveHouseholdResponse.body.FamilyMembers.length).toBe(2);
    expect(retrieveHouseholdResponse.body.FamilyMembers[0].maritalStatus).toBe(
      "Married"
    );
    expect(retrieveHouseholdResponse.body.FamilyMembers[0].spouseId).toBe(
      FamilyMember2.body.id
    );
    expect(retrieveHouseholdResponse.body.FamilyMembers[1].spouseId).toBe(
      FamilyMember1.body.id
    );
  });
});

describe("setParentsForChild endpoint sets parent1 and parent2 IDs in child's family member record", () => {
  test("parent1 and parent2 IDs set", async () => {
    const createHouseholdResponse = await request(app)
      .post("/households/createHousehold")
      .send({ housingType: "Landed" })
      .set("Accept", "application/json");
    await expect(createHouseholdResponse.statusCode).toBe(200);
    const HouseholdId = createHouseholdResponse.body.id;
    // add parents as family members
    const Parent1 = await request(app)
      .post("/family-members/addFamilyMember")
      .send({
        HouseholdId: HouseholdId,
        name: "Parent1",
        gender: "Female",
        maritalStatus: "Single",
        occupationType: "Employed",
        annualIncome: 50000,
        birthDate: new Date("1980-05-15").toISOString(),
      })
      .set("Accept", "application/json");
    const Parent2 = await request(app)
      .post("/family-members/addFamilyMember")
      .send({
        HouseholdId: HouseholdId,
        name: "Parent2",
        gender: "Male",
        maritalStatus: "Single",
        occupationType: "Employed",
        annualIncome: 50000,
        birthDate: new Date("1984-05-15").toISOString(),
      })
      .set("Accept", "application/json");
    // add child as family member
    const Child = await request(app)
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

    // set child's parents
    const setParentsForChildResponse = await request(app)
      .put("/family-members/setParentsForChild")
      .send({
        parent1Id: Parent1.body.id,
        parent2Id: Parent2.body.id,
        childId: Child.body.id,
      })
      .set("Accept", "application/json");

    // retrieve Household and its family members
    const retrieveHouseholdResponse = await request(app)
      .get("/households/retrieveHousehold")
      .query({ id: HouseholdId })
      .set("Accept", "application/json");

    // assert that married couple have each other's IDs as spouseIds
    expect(setParentsForChildResponse.statusCode).toBe(200);
    expect(retrieveHouseholdResponse.statusCode).toBe(200);
    expect(retrieveHouseholdResponse.body.FamilyMembers.length).toBe(3);
    expect(retrieveHouseholdResponse.body.FamilyMembers[2].parent1Id).toBe(
      Parent1.body.id
    );
    expect(retrieveHouseholdResponse.body.FamilyMembers[2].parent2Id).toBe(
      Parent2.body.id
    );
  });
});

describe("removeFamilyMemberFromHousehold endpoint sets family member's HouseholdId to null", () => {
  test("family member's HouseholdId set to null, retrieve household does not retrieve removed family member", async () => {
    const createHouseholdResponse = await request(app)
      .post("/households/createHousehold")
      .send({ housingType: "Landed" })
      .set("Accept", "application/json");
    await expect(createHouseholdResponse.statusCode).toBe(200);
    const HouseholdId = createHouseholdResponse.body.id;
    // add parents as family members
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

    // remove family member 1 from household
    const removeFamilyMemberResponse = await request(app)
      .put("/family-members/removeFamilyMemberFromHousehold")
      .send({
        familyMemberId: FamilyMember1.body.id,
      })
      .set("Accept", "application/json");

    // retrieve Household and its family members
    const retrieveHouseholdResponse = await request(app)
      .get("/households/retrieveHousehold")
      .query({ id: HouseholdId })
      .set("Accept", "application/json");

    // assert that married couple have each other's IDs as spouseIds
    expect(removeFamilyMemberResponse.statusCode).toBe(200);
    expect(retrieveHouseholdResponse.statusCode).toBe(200);
    expect(retrieveHouseholdResponse.body.FamilyMembers.length).toBe(1);
  });
});
