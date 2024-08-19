const mongoose = require('mongoose');
const Member = require('./models/member');

const members = [
    {
        code: "M001",
        name: "Angga",
    },
    {
        code: "M002",
        name: "Ferry",
    },
    {
        code: "M003",
        name: "Putri",
    },
];

mongoose.connect('mongodb://localhost:27017/library', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        console.log('Connected to MongoDB');
        
        // Delete all existing members before seeding new ones
        await Member.deleteMany({});
        
        // Insert new members
        await Member.insertMany(members);
        
        console.log('Members have been successfully seeded');
        mongoose.disconnect();
    })
    .catch(err => console.error('Could not connect to MongoDB...', err));
