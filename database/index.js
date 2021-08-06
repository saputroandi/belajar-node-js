const mongoose = require('mongoose');
const { dbCluster, dbUser, dbPass, dbName } = require('../app/config');

const uriMongoAtlas = `mongodb+srv://${dbUser}:${dbPass}@${dbCluster}.rbraq.mongodb.net/${dbName}?retryWrites=true&w=majority`;

mongoose.connect(uriMongoAtlas, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const db = mongoose.connection;

module.exports = db;
