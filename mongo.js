const { MongoClient } = require('mongodb');
///////////////////////////////////////////////////////
///////////////////// MONGO DB ////////////////////////
///////////////////////////////////////////////////////
async function initDatabase() {

  const url = 'mongodb://localhost:27017';
  const dbName = 'scraper2';

  const client = await MongoClient.connect(url)
  console.log("MongoDB connected successfully!");
  const db = client.db(dbName);
  db.client = client;
  return db;
}


module.exports = initDatabase;