const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  development: {
    client: 'pg',
    connection: process.env.DB_CONNECTION
  },
  production: {
    client: 'pg',
    connection: process.env.DB_CONNECTION
  }
};
