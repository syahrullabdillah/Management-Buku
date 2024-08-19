const express = require('express');
const Borrow = require('./models/Borrow');
const Member = require('./models/Member');
const Book = require('./models/Book');
const app = express();

app.use(express.json());

const bodyParser = require('body-parser');
app.use(bodyParser.json());

// app.get('/books', async (req, res) => {
//     const books = await Book.findAll();
//     res.json(books);
// });

app.post('/borrow', async (req, res) => {
    console.log(req.body.memberId)
    const { memberId, bookId } = req.body[0];

    try {
        const member = memberId;
        const book = bookId;
        console.log(memberId)


        if (!member || !book) {
            return res.status(404).json({ error: 'Member or book not found' });
        }

        // Cek jumlah buku yang dipinjam anggota
        const borrowedBooksCount = await Borrow.count({ where: { MemberId: memberId, returnDate: null } });
        if (borrowedBooksCount >= 2) {
            return res.status(400).json({ error: 'Member cannot borrow more than 2 books' });
        }

        // Cek apakah buku sudah dipinjam oleh anggota lain
        const isBookBorrowed = await Borrow.findOne({ where: { BookId: bookId, returnDate: null } });
        if (isBookBorrowed) {
            return res.status(400).json({ error: 'Book is already borrowed by another member' });
        }

        // Cek apakah anggota sedang dalam penalti
        const lastBorrow = await Borrow.findOne({
            where: { MemberId: memberId },
            order: [['returnDate', 'DESC']]
        });
        
        if (lastBorrow && lastBorrow.dueDate && lastBorrow.returnDate) {
            const dueDate = new Date(lastBorrow.dueDate);
            const returnDate = new Date(lastBorrow.returnDate);
        
            // Reset time portion to 00:00:00 for both dates
            dueDate.setHours(0, 0, 0, 0);
            returnDate.setHours(0, 0, 0, 0);
        
            const diffDays = (returnDate - dueDate) / (24 * 60 * 60 * 1000);
        
            console.log('Due Date:', dueDate);
            console.log('Return Date:', returnDate);
            console.log('Difference in Days:', diffDays);
        
            if (diffDays > 7) {
                return res.status(400).json({ error: 'Member is currently penalized and cannot borrow books' });
            }
        }
        
        // Jika semua syarat terpenuhi, lakukan peminjaman
        await Borrow.create({ MemberId: memberId, BookId: bookId, borrowDate: new Date() });

        res.json({ message: 'Book borrowed successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to borrow book' });
    }
});

app.post('/return', async (req, res) => {
    const { memberId, bookId } = req.body[0];

    try {
        const borrowRecord = await Borrow.findOne({
            where: { MemberId: memberId, BookId: bookId, returnDate: null }
        });
        // console.log(borrowRecord);
        if (!borrowRecord) {
            return res.status(400).json({ error: 'This book was not borrowed by the member' });
        }
        
        // Hitung durasi peminjaman
        const borrowDate = new Date (borrowRecord.borrowDate);
        const currentDate = new Date();
        const diffDays = Math.floor((currentDate - borrowDate) / (1000 * 60 * 60 * 24));

        // console.log(diffDays);
        // console.log(currentDate);

        borrowRecord.id = borrowRecord.id;
        borrowRecord.returnDate = currentDate;
        await borrowRecord.save();

        // console.log(borrowRecord.returnDate);

        // Jika lebih dari 7 hari, beri penalti
        if (diffDays > 7) {
            return res.json({ message: 'Book returned successfully, but the member is penalized for late return' });
        }

        res.json({ message: 'Book returned successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to return book' });
    }
});

app.get('/books', async (req, res) => {
    try {
        const books = await Book.findAll();
        const availableBooks = await Promise.all(books.map(async book => {
            const borrowedCount = await Borrow.count({ where: { BookId: book.id, returnDate: null } });
            const availableStock = book.stock - borrowedCount;

            if (availableStock > 0) {
                return {
                    ...book.toJSON(),
                    availableStock: availableStock
                };
            }
            return null;
        }));

        const filteredBooks = availableBooks.filter(book => book !== null);

        res.json(filteredBooks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch books' });
    }
});


app.get('/members', async (req, res) => {
    try {
        const members = await Member.findAll();
        console.log('Members retrieved:', members.length);

        const membersWithBorrowedCount = await Promise.all(members.map(async member => {
            const borrowedCount = await Borrow.count({ where: { MemberId: member.id, returnDate: null } });
            
            return {
                ...member.toJSON(),
                borrowedBooks: borrowedCount
            };
        }));
        res.json(membersWithBorrowedCount);
    } catch (error) {
        console.error('Error fetching members:', error);
        res.status(500).json({ error: 'Failed to fetch members' });
    }
});


app.get('/allmembers', async (req, res) => {
    try {
        const members = await Member.findAll();
        res.json(members);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch members' });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});








// const express = require('express');
// const mongoose = require('mongoose');

// // Import models
// const Member = require('./models/Member');
// const Book = require('./models/Book');

// const app = express();
// app.use(express.json());

// // Koneksi ke MongoDB
// mongoose.connect('mongodb://localhost:27017/library', { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => console.log('Connected to MongoDB'))
//     .catch(err => console.error('Could not connect to MongoDB...', err));

// // Routes

// // Borrow book
// app.post('/borrow', async (req, res) => {
//     const { memberId, bookId } = req.body;

//     const member = await Member.findById(memberId);
//     const book = await Book.findById(bookId);

//     if (!member || !book) {
//         return res.status(404).send('Member or Book not found');
//     }

//     if (member.borrowedBooks.length >= 2) {
//         return res.status(400).send('Member cannot borrow more than 2 books');
//     }

//     if (book.borrowedBy.includes(memberId)) {
//         return res.status(400).send('Book already borrowed by this member');
//     }

//     if (member.penaltyEndDate && member.penaltyEndDate > new Date()) {
//         return res.status(400).send('Member is currently penalized');
//     }

//     book.borrowedBy.push(memberId);
//     member.borrowedBooks.push({ bookId, borrowDate: new Date() });

//     await book.save();
//     await member.save();

//     res.send('Book borrowed successfully');
// });

// // Return book
// app.post('/return', async (req, res) => {
//     const { memberId, bookId } = req.body;

//     const member = await Member.findById(memberId);
//     const book = await Book.findById(bookId);

//     if (!member || !book) {
//         return res.status(404).send('Member or Book not found');
//     }

//     const borrowedBook = member.borrowedBooks.find(b => b.bookId.toString() === bookId);
//     if (!borrowedBook) {
//         return res.status(400).send('This book was not borrowed by the member');
//     }

//     const borrowDuration = Math.ceil((new Date() - borrowedBook.borrowDate) / (1000 * 60 * 60 * 24));

//     if (borrowDuration > 7) {
//         member.penaltyEndDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days penalty
//     }

//     member.borrowedBooks = member.borrowedBooks.filter(b => b.bookId.toString() !== bookId);
//     book.borrowedBy = book.borrowedBy.filter(b => b.toString() !== memberId);

//     await book.save();
//     await member.save();

//     res.send('Book returned successfully');
// });

// // Check books
// app.get('/books', async (req, res) => {
//     const books = await Book.find();
//     const availableBooks = books.map(book => ({
//         code: book.code,
//         title: book.title,
//         author: book.author,
//         availableQuantity: book.stock - book.borrowedBy.length
//     }));

//     res.json(availableBooks);
// });

// // Check members
// app.get('/members', async (req, res) => {
//     const members = await Member.find().populate('borrowedBooks.bookId');

//     const memberDetails = members.map(member => ({
//         code: member.code,
//         name: member.name,
//         borrowedBooksCount: member.borrowedBooks.length
//     }));

//     res.json(memberDetails);
// });

// // Menjalankan server
// app.listen(3000, () => {
//     console.log('Server running on port 3000');
// });
