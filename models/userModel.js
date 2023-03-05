const { DataTypes } = require('sequelize');
const Sequelize = require('sequelize');
const LandingPage = require("./companyModel.js")
require('dotenv').config()
const db = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',

});


const User = db.define('User', {
    uid: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    companyId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
});

// User.hasMany(LandingPage, { foreignKey: 'uid' });
// LandingPage.belongsTo(User, { foreignKey: 'uid' });
User.sync()
module.exports = User;