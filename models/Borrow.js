const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const Member = require('./Member');
const Book = require('./Book');

const Borrow = sequelize.define('Borrow', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    borrowDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    returnDate: {
        type: DataTypes.DATE,
        allowNull: true
    }
});

// Relasi Many-to-Many
Member.belongsToMany(Book, { through: Borrow });
Book.belongsToMany(Member, { through: Borrow });

module.exports = Borrow;
