const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// Middleware to parse URL-encoded data (form data)
app.use(bodyParser.urlencoded({ extended: true }));

// Route to handle form submission
app.post('/submit', (req, res) => {
    const { name, email } = req.body;
    res.send(`<h1>Thank You!</h1><p>Your name: ${name}</p><p>Your email: ${email}</p>`);
});

// Export the app as the serverless function
module.exports = (req, res) => {
    app(req, res);
};
