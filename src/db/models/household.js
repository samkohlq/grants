"use strict";
module.exports = (sequelize, DataTypes) => {
  const Household = sequelize.define(
    "Household",
    {
      housingType: DataTypes.STRING,
    },
    {}
  );
  Household.associate = function (models) {
    Household.hasMany(models.FamilyMember);
  };
  return Household;
};
