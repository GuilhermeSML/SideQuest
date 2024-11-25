const express = require('express');
const { MongoClient } = require('mongodb');
const ejs = require('ejs');
const path = require('path');

const uri = process.env.MONGODB_URI;  // Replace with your MongoDB connection string
const dbName = "SideQuest";         // Replace with your database name
const collectionName = "userquest";     // Replace with your collection name

const app = express();

app.post('/api/acceptquest', async (req, res) => {
    const client = new MongoClient(uri);
    const { email, name, description } = req.body;

    try {
        // Connect to MongoDB
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        console.log(email + "," + name + "," + description);

        // Insert the form data into the 'User' collection
        const result = await collection.insertOne(
            {
                email: email,
                title: name,
                description: description,
                submittedAt: new Date()
            },
        );

        // Path to the EJS template
        const templatePath = path.join(__dirname, '..', 'views', 'acceptquest.ejs');

        // Render the EJS template with dynamic data
        ejs.renderFile(templatePath, { questTitle: name }, (err, html) => {
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
