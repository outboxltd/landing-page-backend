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
    isRTL: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    mainTitle: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    subTitle: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    isEmailAvailableInForm: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    isNameAvailableInForm: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    isPhoneAvailableInForm: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    icon1:{
        type: DataTypes.TEXT,
        allowNull: true
    },
    icon2:{
        type: DataTypes.TEXT,
        allowNull: true
    },
    icon3:{
        type: DataTypes.TEXT,
        allowNull: true
    },
    middleText1: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    middleText2: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    middleText3: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    title1: {
        type: DataTypes.STRING,
        allowNull: true
    },
    description1: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    title2: {
        type: DataTypes.STRING,
        allowNull: true
    },
    description2: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    title3: {
        type: DataTypes.STRING,
        allowNull: true
    },
    description3: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    hero: {
        type: DataTypes.STRING,
        allowNull: true
    },
    image1: {
        type: DataTypes.STRING,
        allowNull: true
    },
    image2: {
        type: DataTypes.STRING,
        allowNull: true
    },
    image3: {
        type: DataTypes.STRING,
        allowNull: true
    },
    testimonialText1:{
        type: DataTypes.TEXT,
        allowNull: true
    },
    testimonialImg1:{
        type: DataTypes.STRING,
        allowNull: true
    },
    testimonialText2:{
        type: DataTypes.TEXT,
        allowNull: true
    },
    testimonialImg2:{
        type: DataTypes.STRING,
        allowNull: true
    },
    testimonialText3:{
        type: DataTypes.TEXT,
        allowNull: true
    },
    testimonialImg3:{
        type: DataTypes.STRING,
        allowNull: true
    },
});

LandingPage.sync();
module.exports= LandingPage;