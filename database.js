const { Sequelize } = require('sequelize');

// Membuat koneksi ke SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'library.sqlite',  // File database SQLite akan disimpan di file ini
});

module.exports = sequelize;