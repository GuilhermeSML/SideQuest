const express = require('express');
const { MongoClient } = require('mongodb');
const ejs = require('ejs');
const path = require('path');

const uri = process.env.CONNECTION_STRING;  // Replace with your MongoDB connection string
const dbName = "SideQuest";         // Replace with your database name
const collectionName = "users";     // Replace with your collection name

const app = express();

app.post('/api/profile', async (req, res) => {
    const client = new MongoClient(uri);
    const { email } = req.body;

    try {
        // Connect to MongoDB
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        console.log('Email from req.body:', req.body.email);

        // Fetch the user by email
        const user = await collection.findOne({ email: email });

        if (!user) {
            res.status(404).send('User not found');
            return; // Exit the handler to prevent further execution
        }

        // Path to the EJS template
        const templatePath = path.join(__dirname, '..', 'views', 'profile.ejs');
        console.log('Template Path:', templatePath);

        console.log('User Data:', user);

        // Render the EJS template with dynamic data
        ejs.renderFile(templatePath, user, (err, html) => {
            if (err) {
                console.error('Error rendering EJS template:', err);
                res.status(500).send('Internal Server Error');
                return;
            }

            res.setHeader('Content-Type', 'text/html');
            res.send(html);
        });
    } catch (err) {
        console.error("Error fetching user data:", err);
        res.status(500).send("Failed to fetch user data.");
    } finally {
        await client.close();
    }
});

// Export the app as a serverless function
module.exports = (req, res) => {
    app(req, res);
};
