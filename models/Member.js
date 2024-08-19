const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Member = sequelize.define('Member', {
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = Member;
