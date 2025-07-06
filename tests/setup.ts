import { dbConnection } from "@/providers/database/connection";

export async function teardown() {
	await dbConnection.end();
}
