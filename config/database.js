const Sequelize = require('sequelize');
require('dotenv').config()

const db = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_password, {
    host: '127.0.0.1',
    dialect: 'mysql'
});


try {
    db.authenticate();
    console.log('Connection has been established successfully.');
} catch (error) {
    console.error('Unable to connect to the database:', error);
}

module.exports=db