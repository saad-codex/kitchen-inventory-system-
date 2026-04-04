import { sqlGet, sqlRun } from "@/lib/sqlite";
import { getUserIdFromRequest } from "@/lib/auth";
import {
  MSG_UNAUTHORIZED,
  CODE_UNAUTHORIZED,
  jsonError,
  parseJsonObject,
  respondWithError,
} from "@/lib/api-errors";

export async function GET(request, context) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return jsonError(MSG_UNAUTHORIZED, 401, CODE_UNAUTHORIZED);
    }

    const { id } = await context.params;
    if (!id) {
      return jsonError(
        "Invalid kitchen ID.",
        400,
        "INVALID_KITCHEN_ID"
      );
    }

    const doc = await sqlGet(
      "SELECT id, kitchen_name, location FROM kitchens WHERE id = ? AND user_id = ?",
      id,
      userId
    );
    if (!doc) {
      return jsonError(
        "No kitchen found with this ID for your account.",
        404,
        "KITCHEN_NOT_FOUND"
      );
    }
    return Response.json({
      _id: String(doc.id),
      kitchen_name: doc.kitchen_name,
      location: doc.location,
    });
  } catch (err) {
    return respondWithError(
      err,
      "kitchens GET [id]",
      "Could not load this kitchen."
    );
  }
}

export async function PUT(request, context) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return jsonError(MSG_UNAUTHORIZED, 401, CODE_UNAUTHORIZED);
    }

    const { id } = await context.params;
    if (!id) {
      return jsonError(
        "Invalid kitchen ID.",
        400,
        "INVALID_KITCHEN_ID"
      );
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

    const upd = await sqlRun(
      "UPDATE kitchens SET kitchen_name = ?, location = ? WHERE id = ? AND user_id = ?",
      kitchen_name,
      location,
      id,
      userId
    );
    if (upd.changes === 0) {
      return jsonError(
        "No kitchen found with this ID for your account.",
        404,
        "KITCHEN_NOT_FOUND"
      );
    }

    const doc = await sqlGet(
      "SELECT id, kitchen_name, location FROM kitchens WHERE id = ? AND user_id = ?",
      id,
      userId
    );

    return Response.json({
      _id: String(doc.id),
      kitchen_name: doc.kitchen_name,
      location: doc.location,
    });
  } catch (err) {
    return respondWithError(
      err,
      "kitchens PUT [id]",
      "Could not update this kitchen."
    );
  }
}

export async function DELETE(request, context) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return jsonError(MSG_UNAUTHORIZED, 401, CODE_UNAUTHORIZED);
    }

    const { id } = await context.params;
    if (!id) {
      return jsonError(
        "Invalid kitchen ID.",
        400,
        "INVALID_KITCHEN_ID"
      );
    }

    const del = await sqlRun(
      "DELETE FROM kitchens WHERE id = ? AND user_id = ?",
      id,
      userId
    );
    if (del.changes === 0) {
      return jsonError(
        "No kitchen found with this ID for your account.",
        404,
        "KITCHEN_NOT_FOUND"
      );
    }
    return Response.json({
      ok: true,
      message: "Kitchen deleted successfully.",
    });
  } catch (err) {
    return respondWithError(
      err,
      "kitchens DELETE [id]",
      "Could not delete this kitchen."
    );
  }
}
