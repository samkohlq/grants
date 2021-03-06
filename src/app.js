import cookieParser from "cookie-parser";
import "core-js";
import express from "express";
import logger from "morgan";
import path from "path";
import "regenerator-runtime";
import familyMemberRouter from "./routes/familyMemberRouter";
import grantsRouter from "./routes/grantsRouter";
import householdRouter from "./routes/householdRouter";
import indexRouter from "./routes/index";

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/households", householdRouter);
app.use("/family-members", familyMemberRouter);
app.use("/grants", grantsRouter);

module.exports = app;
