const express = require('express');
const { MongoClient } = require('mongodb');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const ejs = require('ejs');
const path = require('path');

const app = express();

// Connection URL and Database Name
const uri = process.env.MONGODB_URI;  // Replace with your MongoDB connection string
const dbName = "SideQuest";  // Replace with your desired database name

// SetUp Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const jsonStructure = `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Generated schema for Root",
  "type": "object",
  "properties": {
    "Interests": {
      "type": "string"
    },
    "Name": {
      "type": "string"
    },
    "Description": {
      "type": "string"
    }
  },
  "required": [
    "Interests",
    "Name",
    "Description"
  ]
}`

app.post('/api/profileaction', async (req, res) => {
    if (!req.body) {
        return res.status(400).send('Request body is missing');
    }
    const { name, email, interests, location, action } = req.body;

    // MongoDB Client
    const client = new MongoClient(uri);

    if (action === 'generate') {
        try {

            // Set up question and answer
            const prompt = "My interests are the following: " + interests + "Get me one random task in " + location + "this JSON schema:" + jsonStructure;

            const inputText = await model.generateContent(prompt);
            const cleanJson = JSON.parse(inputText.response.text().replaceAll("```", "").replace("json", ""));

            console.log(JSON.stringify(cleanJson));

            // Path to the EJS template
            const templatePath = path.join(__dirname, '..', 'views', 'sidequest.ejs');
            console.log('Template Path:', templatePath);

            // Render the EJS template with dynamic data
            ejs.renderFile(templatePath, { data: cleanJson }, (err, html) => {
                if (err) {
                    console.error('Error rendering EJS template:', err);
                    res.status(500).send('Internal Server Error');
                    return;
                }
                res.setHeader('Content-Type', 'text/html');
                res.send(html);
            });

        } catch (error) {
            console.error("An error occurred:", error);
            res.status(500).send("An error occurred while submitting the form.");
        }
    } else if (action === 'edit') {

        try {
            // Connect to the MongoDB server
            await client.connect();
            console.log("Connected to MongoDB!");

            // Access the database and collection
            const db = client.db(dbName);
            const collection = db.collection('users');  // Use your desired collection name
            // Fetch the user by email
            const user = await collection.findOne({ email: email });

            // Path to the EJS template
            const templatePath = path.join(__dirname, '..', 'views', 'edit.ejs');
            console.log('Template Path:', templatePath);

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
            // Close the connection
            await client.close();
            console.log("Connection closed.");
        }
    }
});

// Export the app as a serverless function
module.exports = (req, res) => {
    app(req, res);
};