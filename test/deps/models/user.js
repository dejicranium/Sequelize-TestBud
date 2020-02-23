'use strict';
module.exports = (sequelize, DataTypes) => {
  const users = sequelize.define('users', {
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    password: DataTypes.STRING,
    university_id: DataTypes.INTEGER,
    image: DataTypes.INTEGER,
    sex: DataTypes.STRING,
    username: DataTypes.STRING,
    status: DataTypes.STRING,
    bio: DataTypes.TEXT
  }, {});
  users.associate = function(models) {
    // associations can be defined here
  };
  return users;
};