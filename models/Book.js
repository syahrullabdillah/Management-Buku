const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Book = sequelize.define('Book', {
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    author: {
        type: DataTypes.STRING,
        allowNull: false
    },
    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    }
});

module.exports = Book;
