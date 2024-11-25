const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const ejs = require('ejs');
const path = require('path');

const app = express();

// SetUp Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const jsonStructure = `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Generated schema for Root",
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "Category": {
        "type": "string"
      },
      "Items": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "Name": {
              "type": "string"
            },
            "Description": {
              "type": "string"
            }
          },
          "required": [
            "Name",
            "Description"
          ]
        }
      }
    },
    "required": [
      "Category",
      "Items"
    ]
  }
}`

app.post('/api/edit', async (req, res) => {
    if (!req.body) {
        return res.status(400).send('Request body is missing');
    }
    const { name, email, interests, location, action } = req.body;

    if (action === 'generate') {
        try {

            // Set up question and answer
            //const prompt = "My interests are the following: " + interests + " get me a list of 3 items each to do in " + location;

            const prompt = "My interests are the following: " + interests + " get me a list of 3 items each to do in " + location + "this JSON schema:" + jsonStructure;


            const inputText = await model.generateContent(prompt);
            const sideQuestText = "Here are some generated side quests based on your location and interesses";

            const cleanJson = JSON.parse(inputText.response.text().replaceAll("```","").replace("json",""));

            console.log(JSON.stringify(cleanJson));

            // Path to the EJS template
            const templatePath = path.join(__dirname, '..', 'views', 'sidequest.ejs');
            console.log('Template Path:', templatePath);

            // Render the EJS template with dynamic data
            ejs.renderFile(templatePath, { data: cleanJson, sideQuestText: sideQuestText }, (err, html) => {
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
            console.log('Email from req.body:', req.body.email);

            // Path to the EJS template
            const templatePath = path.join(__dirname, '..', 'views', 'edit.ejs');
            console.log('Template Path:', templatePath);

            // Render the EJS template with dynamic data
            ejs.renderFile(templatePath, req.body, (err, html) => {
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
        }
    }
});

// Export the app as a serverless function
module.exports = (req, res) => {
    app(req, res);
};