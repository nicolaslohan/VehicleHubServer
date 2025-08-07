import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { schema } from "./schema";

// This sets up the connection client
export const sql = postgres(process.env.DATABASE_URL as string);

// This sets up the Drizzle instance for you to use elsewhere
export const db = drizzle(sql, {
	schema,
	casing: "snake_case",
});
