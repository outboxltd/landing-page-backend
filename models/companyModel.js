const Sequelize = require('sequelize');
// const db =require ("../config/database.js");
const { DataTypes } = Sequelize;

const db = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    
});
const connectDB = async () => {
    try {
      await db.authenticate();
      console.log('Connection has been established successfully.');
    } catch (error) {
      console.error('Unable to connect to the database:', error);
    }
  };

  connectDB()


const LandingPage = db.define('LandingPage', {
    brand: {
        type: DataTypes.STRING,
        allowNull: false
    },
    title1: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description1: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    title2: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description2: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    title3: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description3: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    hero: {
        type: DataTypes.BLOB,
        allowNull: false
    },
    image1: {
        type: DataTypes.BLOB,
        allowNull: false
    },
    image2: {
        type: DataTypes.BLOB,
        allowNull: false
    },
    image3: {
        type: DataTypes.BLOB,
        allowNull: false
    }
});

LandingPage.sync();
module.exports= LandingPage;