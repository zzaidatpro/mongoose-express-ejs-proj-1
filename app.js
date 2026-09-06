const { MongoClient } = require('mongodb');

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("Connecté avec succès à MongoDB");
    const db = client.db('yourDatabaseName');
    // Effectuez des opérations avec db ici
  } finally {
    await client.close();
  }
}

run().catch(console.dir);