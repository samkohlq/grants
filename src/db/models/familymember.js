"use strict";
module.exports = (sequelize, DataTypes) => {
  const FamilyMember = sequelize.define(
    "FamilyMember",
    {
      name: DataTypes.STRING,
      gender: DataTypes.STRING,
      maritalStatus: DataTypes.STRING,
      spouseId: DataTypes.INTEGER,
      occupationType: DataTypes.STRING,
      annualIncome: DataTypes.INTEGER,
      birthDate: DataTypes.DATE,
      parent1Id: DataTypes.INTEGER,
      parent2Id: DataTypes.INTEGER,
    },
    {
      paranoid: true,
    }
  );
  FamilyMember.associate = (models) => {
    FamilyMember.belongsTo(models.Household);
  };
  return FamilyMember;
};
