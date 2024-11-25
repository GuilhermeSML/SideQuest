const express = require('express');
const { MongoClient } = require('mongodb');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

// Connection URL and Database Name
const uri = process.env.MONGODB_URI;  // Replace with your MongoDB connection string
const dbName = "SideQuest";  // Replace with your desired database name

// SetUp Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.post('/api/generate', async (req, res) => {
    const {email} = req.body;

    // MongoDB Client
    const client = new MongoClient(uri);

    try {
        // Connect to the MongoDB server
        await client.connect();
        console.log("Connected to MongoDB!");

        // Access the database and collection
        const db = client.db(dbName);
        const collection = db.collection('users');  // Use your desired collection name

        // find the User in the collection
        const result = await collection.findOne(
            { email: email }, // The filter criteria (find the document by email)
        );
        // Set up question and answer
        const prompt = "My interests are the following: " + result.interests + " get me a list of 3 items each to do in " + result.location;
        const inputText = await model.generateContent(prompt);

        // Redirect to a thank-you page after successful form submission
        res.send('<h2>Side Quest:</h2> <br/> ' + inputText.response.text().replaceAll('\n', '<br/>'));

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