const { DataTypes } = require('sequelize');
const Sequelize = require('sequelize');
require('dotenv').config()
const db = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',

});


const FormModel = db.define('FormModel', {
    companyId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    leadStatus:{
        type: DataTypes.INTEGER,
        allowNull: true
    }
});

FormModel.sync()
module.exports = FormModel;