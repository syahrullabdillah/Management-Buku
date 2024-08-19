const sequelize = require('./database');
const Book = require('./models/Book');
const Member = require('./models/Member');

const seedBooks = [
    { code: "JK-45", title: "Harry Potter", author: "J.K Rowling", stock: 1 },
    { code: "SHR-1", title: "A Study in Scarlet", author: "Arthur Conan Doyle", stock: 1 },
    { code: "TW-11", title: "Twilight", author: "Stephenie Meyer", stock: 1 },
    { code: "HOB-83", title: "The Hobbit, or There and Back Again", author: "J.R.R. Tolkien", stock: 1 },
    { code: "NRN-7", title: "The Lion, the Witch and the Wardrobe", author: "C.S. Lewis", stock: 1 },
];

const seedMembers = [
    { code: "M001", name: "Angga" },
    { code: "M002", name: "Ferry" },
    { code: "M003", name: "Putri" },
];

sequelize.sync({ force: true })
    .then(async () => {
        console.log("Database synced successfully.");

        // Check if Book and Member models are recognized
        console.log("Book Model:", Book);
        console.log("Member Model:", Member);

        await Book.bulkCreate(seedBooks);
        await Member.bulkCreate(seedMembers);

        console.log("Database seeded successfully.");
        sequelize.close();
    })
    .catch(err => console.error('Failed to seed database:', err));
