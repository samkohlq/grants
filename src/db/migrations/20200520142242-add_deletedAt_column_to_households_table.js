"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("Households", "deletedAt", Sequelize.DATE);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("Households", "deletedAt");
  },
};
