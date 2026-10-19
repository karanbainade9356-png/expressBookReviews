const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Check if a username is already taken
const isValid = (username) => {
  return users.some((user) => user.username === username);
};

// Check if username and password match records
const authenticatedUser = (username, password) => {
  return users.some((user) => user.username === username && user.password === password);
};

// Only registered users can login: POST /customer/login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Error logging in: username and password are required" });
  }

  if (authenticatedUser(username, password)) {
    // Generate JWT access token
    let accessToken = jwt.sign(
      { username: username },
      'access',
      { expiresIn: 60 * 60 }
    );

    // Store in session
    req.session.authorization = {
      accessToken,
      username
    };

    return res.status(200).json({
      message: "Customer successfully logged in",
      token: accessToken
    });
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add or modify a book review: PUT /customer/auth/review/:isbn
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review || req.body.review;
  const username = req.session.authorization ? req.session.authorization.username : (req.user ? req.user.username : null);

  if (!username) {
    return res.status(403).json({ message: "User not logged in or session expired" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
  }

  if (!review) {
    return res.status(400).json({ message: "Review content is required in query parameter (?review=...)" });
  }

  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  // Add or update review by this specific user
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: `Review for book with ISBN ${isbn} has been added/updated.`,
    reviews: books[isbn].reviews
  });
});

// Delete a book review: DELETE /customer/auth/review/:isbn
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization ? req.session.authorization.username : (req.user ? req.user.username : null);

  if (!username) {
    return res.status(403).json({ message: "User not logged in" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
  }

  if (books[isbn].reviews && books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];
    return res.status(200).json({
      message: `Review for ISBN ${isbn} posted by ${username} has been deleted.`,
      reviews: books[isbn].reviews
    });
  } else {
    return res.status(404).json({
      message: `No review found for user ${username} on book with ISBN ${isbn}`
    });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
