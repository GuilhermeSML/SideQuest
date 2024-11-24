const express = require('express');
//const helmet = require('helmet');
const bodyParser = require('body-parser');

const app = express();

// Middleware to parse URL-encoded data (form data)
app.use(bodyParser.urlencoded({ extended: true }));

// Route to handle form submission
app.post('/submit', (req, res) => {});

// Export the app as the serverless function
module.exports = (req, res) => {
    app(req, res);
};
