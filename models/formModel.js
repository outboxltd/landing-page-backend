const { DataTypes } = require('sequelize');
const Sequelize = require('sequelize');
require('dotenv').config()
const db = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',

});
// const connectDB = async () => {
//     try {
//         await db.authenticate();
//         console.log('Connection has been established successfully.');
//     } catch (error) {
//         console.error('Unable to connect to the database:', error);
//     }
// };

// connectDB()


const FormModel = db.define('FormModel', {
    companyId: {
        type: DataTypes.NUMBER,
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
    }
});

FormModel.sync()
module.exports = FormModel;