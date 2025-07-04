import { Pool } from "pg";

export const dbConnection = new Pool({
	host: process.env.DB_HOST,
	port: Number(process.env.DB_PORT),
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE,
});

export async function testDbConnection() {
	await dbConnection.query("SELECT 1");
}
