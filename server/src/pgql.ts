import knex from 'knex';

export interface User {
  id: string;
  username: string;
  password: string;
  balance: number;
}

export default knex({ client: 'pg', connection: process.env.DB_CONNECTION, searchPath: ['knex', 'public'] });
