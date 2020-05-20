"use strict";
module.exports = (sequelize, DataTypes) => {
  const Household = sequelize.define(
    "Household",
    {
      housingType: DataTypes.STRING,
    },
    {
      paranoid: true,
    }
  );
  Household.associate = (models) => {
    Household.hasMany(models.FamilyMember);
  };
  return Household;
};
