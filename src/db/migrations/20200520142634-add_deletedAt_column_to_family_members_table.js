"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      "FamilyMembers",
      "deletedAt",
      Sequelize.DATE
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("FamilyMembers", "deletedAt");
  },
};
