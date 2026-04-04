import { sqlGet } from "@/lib/sqlite";
import { respondWithError } from "@/lib/api-errors";

export async function GET() {
  try {
    await sqlGet("SELECT id FROM users LIMIT 1");
    return Response.json({
      ok: true,
      message: "Server and SQLite are connected.",
    });
  } catch (err) {
    return respondWithError(
      err,
      "test-db GET",
      "Database connection test failed."
    );
  }
}
