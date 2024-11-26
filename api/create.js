const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');

const app = express();

// Connection URL and Database Name
const uri = process.env.MONGODB_URI;  // Replace with your MongoDB connection string
const dbName = "SideQuest";  // Replace with your desired database name

// POST route to handle form submission
app.post('/api/create', async (req, res) => {
  if (!req.body) {
    return res.status(400).send('Request body is missing');
  }
  const { name, email, interests, location, password, difficulty } = req.body;

  // MongoDB Client
  const client = new MongoClient(uri);

  try {
    // Connect to the MongoDB server
    await client.connect();
    console.log("Connected to MongoDB!");

    // Access the database and collection
    const db = client.db(dbName);
    const collection = db.collection('users');  // Use your desired collection name

    // Check if the email already exists in the database
    const existingUser = await collection.findOne({ email: email });

    if (existingUser) {
      // If email exists, send a push notification or a message indicating the error
      return res.status(400).json({
        message: 'Email already exists',
        success: false
      });
    }

    // If email doesn't exist, insert the form data into the 'User' collection
    const result = await collection.insertOne({
      name: name,
      email: email,
      password: password,
      interests: interests,
      location: location,
      difficulty: difficulty,
      submittedAt: new Date()
    });

    // If successful, redirect to home page or other destination
    
    return res.status(200).json({
      message: 'Account created',
      success: true
    });

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
