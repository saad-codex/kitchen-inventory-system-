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
        "Invalid item ID.",
        400,
        "INVALID_ITEM_ID"
      );
    }

    const doc = await sqlGet(
      "SELECT id, item_name, unit, category FROM items WHERE id = ? AND user_id = ?",
      id,
      userId
    );
    if (!doc) {
      return jsonError(
        "No item found with this ID for your account.",
        404,
        "ITEM_NOT_FOUND"
      );
    }
    return Response.json({
      _id: String(doc.id),
      item_name: doc.item_name,
      unit: doc.unit,
      category: doc.category,
    });
  } catch (err) {
    return respondWithError(
      err,
      "items GET [id]",
      "Could not load this item."
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
        "Invalid item ID.",
        400,
        "INVALID_ITEM_ID"
      );
    }

    const parsed = await parseJsonObject(request);
    if (!parsed.ok) {
      return parsed.response;
    }
    const body = parsed.body;

    const item_name =
      typeof body.item_name === "string" ? body.item_name.trim() : "";
    const unit = typeof body.unit === "string" ? body.unit.trim() : "";
    const category =
      typeof body.category === "string" ? body.category.trim() : "";

    if (!item_name) {
      return jsonError(
        "Item name is required.",
        400,
        "ITEM_NAME_REQUIRED"
      );
    }
    if (!unit) {
      return jsonError(
        "Unit of measurement is required.",
        400,
        "ITEM_UNIT_REQUIRED"
      );
    }
    if (!category) {
      return jsonError(
        "Category is required.",
        400,
        "ITEM_CATEGORY_REQUIRED"
      );
    }

    const upd = await sqlRun(
      "UPDATE items SET item_name = ?, unit = ?, category = ? WHERE id = ? AND user_id = ?",
      item_name,
      unit,
      category,
      id,
      userId
    );
    if (upd.changes === 0) {
      return jsonError(
        "No item found with this ID for your account.",
        404,
        "ITEM_NOT_FOUND"
      );
    }

    const doc = await sqlGet(
      "SELECT id, item_name, unit, category FROM items WHERE id = ? AND user_id = ?",
      id,
      userId
    );

    return Response.json({
      _id: String(doc.id),
      item_name: doc.item_name,
      unit: doc.unit,
      category: doc.category,
    });
  } catch (err) {
    return respondWithError(
      err,
      "items PUT [id]",
      "Could not update this item."
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
        "Invalid item ID.",
        400,
        "INVALID_ITEM_ID"
      );
    }

    const del = await sqlRun(
      "DELETE FROM items WHERE id = ? AND user_id = ?",
      id,
      userId
    );
    if (del.changes === 0) {
      return jsonError(
        "No item found with this ID for your account.",
        404,
        "ITEM_NOT_FOUND"
      );
    }
    return Response.json({
      ok: true,
      message: "Item deleted successfully.",
    });
  } catch (err) {
    return respondWithError(
      err,
      "items DELETE [id]",
      "Could not delete this item."
    );
  }
}
