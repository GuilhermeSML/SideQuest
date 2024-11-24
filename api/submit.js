const express = require('express');
//const helmet = require('helmet');
const { MongoClient } = require('mongodb');

const app = express();

// Connection URL and Database Name
const uri = process.env.ConnectionString;  // Replace with your MongoDB connection string
const dbName = "SideQuest";  // Replace with your desired database name

// POST route to handle form submission
app.post('/api/submit', async (req, res) => {
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

        // Redirect to a thank-you page after successful form submission
        res.send('Thank you for submitting the form!');

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
