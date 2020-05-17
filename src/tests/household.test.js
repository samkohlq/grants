import request from "supertest";
import app from "../app";
import models from "../db/models";

test("createHousehold endpoint creates new household with housingType 'Landed'", async () => {
  // create household
  const response = await request(app)
    .post("/households/createHousehold")
    .send({ housingType: "Landed" })
    .set("Accept", "application/json");
  // assert that response contains the housingType of the new household
  expect(response.statusCode).toBe(200);
  expect(response.body.housingType).toBe("Landed");
  models.sequelize.close();
});

test("createHousehold endpoint validates against unrecognised housingType and does not create new household", async () => {
  // create household
  const response = await request(app)
    .post("/households/createHousehold")
    .send({ housingType: "Underground" })
    .set("Accept", "application/json");
  // assert that response contains the housingType of the new household
  expect(response.statusCode).toBe(422);
  models.sequelize.close();
});
