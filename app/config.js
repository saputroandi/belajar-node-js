const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  serviceName: process.env.SERVICE_NAME,
  secretKey: process.env.SECRET_KEY,

  dbHost: process.env.DB_HOST,
  dbCluster: process.env.DB_CLUSTER,
  dbUser: process.env.DB_USER,
  dbPass: process.env.DB_PASS,
  dbName: process.env.DB_NAME,

  rootPath: path.resolve(__dirname, '..'),
};
