const MongoClient = require('mongodb').MongoClient;
const config = require('config');

const url = config.get('database.url');
let _client;

module.exports = {
  connectToServer: async () => {
    try {
      _client = await MongoClient.connect(url, { useNewUrlParser: true });
      console.log(`Connected to database at ${url}`);
    } catch (err) {
      throw err;
    }
  },

  getDb: () => {
    return _client.db('ecomm');
  }
};
