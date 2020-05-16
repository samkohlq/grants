"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("FamilyMembers", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      gender: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      maritalStatus: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      spouseId: {
        type: Sequelize.INTEGER,
      },
      occupationType: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      annualIncome: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      birthDate: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("FamilyMembers");
  },
};
