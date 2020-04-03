import knex from "knex";

export interface User {
  id: string;
  username: string;
  password: string;
  balance: number;
  avatar: string;
  first_name: string;
  location: string;
  last_name: string;
  deck: string;
}

export default knex({ client: "pg", connection: process.env.DB_CONNECTION, searchPath: ["knex", "public"] });
