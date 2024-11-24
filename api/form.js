const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');

const app = express();

// Middleware to parse URL-encoded data (form data)
app.use(bodyParser.urlencoded({ extended: true }),
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"], // Allow resources from the same origin
            scriptSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://vercel.live", // Allow Vercel scripts
            ],
            styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles
            imgSrc: ["'self'", "data:", "https://vercel.live"], // Allow images from Vercel
            connectSrc: ["'self'", "https://vercel.live"], // Allow connections to Vercel live
            fontSrc: ["'self'", "https://fonts.gstatic.com"], // Allow Google Fonts
            objectSrc: ["'none'"], // Disallow all plugins (e.g., Flash)
            upgradeInsecureRequests: [], // Allow mixed content
        },
    }));

// Route to handle form submission
app.post('/submit', (req, res) => { });

// Export the app as the serverless function
module.exports = (req, res) => {
    app(req, res);
};
