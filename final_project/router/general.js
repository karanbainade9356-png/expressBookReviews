const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new customer
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required for registration." });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: "Customer already exists!" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "Customer successfully registered. Now you can login" });
});

// Helper function: Promise to retrieve all books
const getAllBooksPromise = () => {
  return new Promise((resolve, reject) => {
    if (books) {
      resolve(books);
    } else {
      reject(new Error("Unable to fetch books"));
    }
  });
};

// Task 1 & Task 10: Get the book list available in the shop using async/await with Promise
public_users.get('/', async function (req, res) {
  try {
    const bookList = await getAllBooksPromise();
    return res.status(200).send(JSON.stringify(bookList, null, 4));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Helper function: Promise to retrieve book details by ISBN
const getBookByISBNPromise = (isbn) => {
  return new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject({ status: 404, message: `Book with ISBN ${isbn} not found` });
    }
  });
};

// Task 2 & Task 11: Get book details based on ISBN using async/await with Promise
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const isbn = req.params.isbn;
    const book = await getBookByISBNPromise(isbn);
    return res.status(200).json(book);
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
});

// Helper function: Promise to retrieve books by author
const getBooksByAuthorPromise = (author) => {
  return new Promise((resolve, reject) => {
    const matchingBooks = {};
    const keys = Object.keys(books);
    keys.forEach((key) => {
      if (books[key].author.toLowerCase() === author.toLowerCase()) {
        matchingBooks[key] = books[key];
      }
    });

    if (Object.keys(matchingBooks).length > 0) {
      resolve(matchingBooks);
    } else {
      reject({ status: 404, message: `No books found for author: ${author}` });
    }
  });
};

// Task 3 & Task 12: Get book details based on author using async/await with Promise
public_users.get('/author/:author', async function (req, res) {
  try {
    const author = req.params.author;
    const result = await getBooksByAuthorPromise(author);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 404).json({ message: error.message });
  }
});

// Helper function: Promise to retrieve books by title
const getBooksByTitlePromise = (title) => {
  return new Promise((resolve, reject) => {
    const matchingBooks = {};
    const keys = Object.keys(books);
    keys.forEach((key) => {
      if (books[key].title.toLowerCase() === title.toLowerCase()) {
        matchingBooks[key] = books[key];
      }
    });

    if (Object.keys(matchingBooks).length > 0) {
      resolve(matchingBooks);
    } else {
      reject({ status: 404, message: `No books found with title: ${title}` });
    }
  });
};

// Task 4 & Task 13: Get all books based on title using async/await with Promise
public_users.get('/title/:title', async function (req, res) {
  try {
    const title = req.params.title;
    const result = await getBooksByTitlePromise(title);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 404).json({ message: error.message });
  }
});

// Task 5 & Task 6: Get book review based on ISBN
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  } else {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
  }
});

// =========================================================================
// Optional Axios Clients for Tasks 10-14 Demonstration
// Can be invoked externally to test Axios promise/async consumption
// =========================================================================
public_users.get('/async/books', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5000/');
    return res.status(200).json(response.data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

public_users.get('/async/isbn/:isbn', async (req, res) => {
  try {
    const response = await axios.get(`http://localhost:5000/isbn/${req.params.isbn}`);
    return res.status(200).json(response.data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

public_users.get('/async/author/:author', async (req, res) => {
  try {
    const response = await axios.get(`http://localhost:5000/author/${req.params.author}`);
    return res.status(200).json(response.data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

public_users.get('/async/title/:title', async (req, res) => {
  try {
    const response = await axios.get(`http://localhost:5000/title/${req.params.title}`);
    return res.status(200).json(response.data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports.general = public_users;
