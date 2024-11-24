const { MongoClient } = require('mongodb');

// Connection URL and Database Name
const uri = "mongodb://localhost:27017"; // Replace with your connection string
const dbName = "myDatabase";

async function main() {
    const client = new MongoClient(uri);

    try {
        // Connect to the MongoDB server
        await client.connect();
        console.log("Connected to MongoDB!");

        // Access the database and collection
        const db = client.db(dbName);
        const collection = db.collection('User');    

    } catch (error) {
        console.error("An error occurred:", error);
    } finally {
        // Close the connection
        await client.close();
        console.log("Connection closed.");
    }
}

main().catch(console.error);