const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

// In-memory database
let books = [
  { id: 1, title: "The Great Gatsby", author: "F. Scott Fitzgerald", isbn: "978-0743273565" },
  { id: 2, title: "To Kill a Mockingbird", author: "Harper Lee", isbn: "978-0446310789" }
];

// Get all books
app.get('/books', (req, res) => {
  res.json(books);
});

// Get a single book by ID
app.get('/books/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const book = books.find(book => book.id === id);
  
  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }
  
  res.json(book);
});

// Add a new book
app.post('/books', (req, res) => {
  const newBook = {
    id: books.length + 1,
    title: req.body.title,
    author: req.body.author,
    isbn: req.body.isbn
  };
  books.push(newBook);
  res.status(201).json(newBook);
});

// Delete a book
app.delete('/books/:id', (req, res) => {
  const id = parseInt(req.params.id);
  books = books.filter(book => book.id !== id);
  res.status(204).send();
});

// Update a book
app.put('/books/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const bookIndex = books.findIndex(book => book.id === id);
  
  if (bookIndex === -1) {
    return res.status(404).json({ error: 'Book not found' });
  }

  books[bookIndex] = {
    ...books[bookIndex],
    title: req.body.title,
    author: req.body.author,
    isbn: req.body.isbn
  };

  res.json(books[bookIndex]);
});

// Search books
app.get('/books/search', (req, res) => {
  const query = req.query.q.toLowerCase();
  const searchTitle = req.query.title === 'true';
  const searchAuthor = req.query.author === 'true';
  const searchISBN = req.query.isbn === 'true';

  const results = books.filter(book => {
    if (searchTitle && book.title.toLowerCase().includes(query)) return true;
    if (searchAuthor && book.author.toLowerCase().includes(query)) return true;
    if (searchISBN && book.isbn.toLowerCase().includes(query)) return true;
    return false;
  });

  res.json(results);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 