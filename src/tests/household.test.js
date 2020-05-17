import request from "supertest";
import app from "../app";
import models from "../db/models";

afterEach(async () => {
  // clean up database after each test is done
  await models.Household.destroy({ where: {} });
});

afterAll(() => {
  // close sequelize connection when all tests are done
  models.sequelize.close();
});

describe("createHousehold endpoint validates and creates households", () => {
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
    // assert that response contains the housingType of the new household
    expect(response.statusCode).toBe(422);
  });
});
