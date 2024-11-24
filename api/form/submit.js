const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');

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

// Connection URL and Database Name
const uri = process.env.ConnectionString;  // Replace with your MongoDB connection string
const dbName = "SideQuest";  // Replace with your desired database name

// POST route to handle form submission
app.post('/', async (req, res) => {
    const { name, email, interests, location } = req.body;

    // MongoDB Client
    const client = new MongoClient(uri);

    try {
        // Connect to the MongoDB server
        await client.connect();
        console.log("Connected to MongoDB!");

        // Access the database and collection
        const db = client.db(dbName);
        const collection = db.collection('users');  // Use your desired collection name

        // Insert the form data into the 'User' collection
        const result = await collection.insertOne({
            name: name,
            email: email,
            interests: interests,
            location: location,
            submittedAt: new Date()  // Add the current date/time to track submissions
        });

        // Respond with a success message
        res.send(`
            <h1>Thank You, ${name}!</h1>
            <p>Your email (${email}) has been submitted successfully!</p>
            <p>Form data stored in MongoDB!</p>
            <a href="/">Go back to the form</a>
        `);
    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send("An error occurred while submitting the form.");
    } finally {
        // Close the connection
        await client.close();
        console.log("Connection closed.");
    }
});

// Export the app as a serverless function
module.exports = (req, res) => {
    app(req, res);
};
