import { sqlAll, sqlGet, sqlRun, newId } from "@/lib/sqlite";
import { getUserIdFromRequest } from "@/lib/auth";
import {
  MSG_UNAUTHORIZED,
  CODE_UNAUTHORIZED,
  jsonError,
  parseJsonObject,
  respondWithError,
} from "@/lib/api-errors";

export async function GET(request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return jsonError(MSG_UNAUTHORIZED, 401, CODE_UNAUTHORIZED);
    }

    const kitchens = await sqlAll(
      "SELECT id, kitchen_name, location FROM kitchens WHERE user_id = ? ORDER BY kitchen_name ASC",
      userId
    );
    return Response.json(
      kitchens.map((doc) => ({
        _id: String(doc.id),
        kitchen_name: doc.kitchen_name,
        location: doc.location,
      }))
    );
  } catch (err) {
    return respondWithError(
      err,
      "kitchens GET",
      "Could not load kitchens. Please try again later."
    );
  }
}

export async function POST(request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return jsonError(MSG_UNAUTHORIZED, 401, CODE_UNAUTHORIZED);
    }

    const parsed = await parseJsonObject(request);
    if (!parsed.ok) {
      return parsed.response;
    }
    const body = parsed.body;

    const kitchen_name =
      typeof body.kitchen_name === "string"
        ? body.kitchen_name.trim()
        : "";
    const location =
      typeof body.location === "string" ? body.location.trim() : "";

    if (!kitchen_name) {
      return jsonError(
        "Kitchen name is required.",
        400,
        "KITCHEN_NAME_REQUIRED"
      );
    }
    if (!location) {
      return jsonError(
        "Kitchen location is required.",
        400,
        "KITCHEN_LOCATION_REQUIRED"
      );
    }

    const id = newId();
    await sqlRun(
      "INSERT INTO kitchens (id, user_id, kitchen_name, location) VALUES (?, ?, ?, ?)",
      id,
      userId,
      kitchen_name,
      location
    );
    const doc = await sqlGet(
      "SELECT id, kitchen_name, location FROM kitchens WHERE id = ?",
      id
    );

    return Response.json({
      _id: String(doc.id),
      kitchen_name: doc.kitchen_name,
      location: doc.location,
    });
  } catch (err) {
    return respondWithError(
      err,
      "kitchens POST",
      "Could not create the kitchen."
    );
  }
}
