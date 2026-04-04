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

    const items = await sqlAll(
      "SELECT id, item_name, unit, category FROM items WHERE user_id = ? ORDER BY item_name ASC",
      userId
    );
    return Response.json(
      items.map((doc) => ({
        _id: String(doc.id),
        item_name: doc.item_name,
        unit: doc.unit,
        category: doc.category,
      }))
    );
  } catch (err) {
    return respondWithError(
      err,
      "items GET",
      "Could not load items. Please try again later."
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

    const id = newId();
    await sqlRun(
      "INSERT INTO items (id, user_id, item_name, unit, category) VALUES (?, ?, ?, ?, ?)",
      id,
      userId,
      item_name,
      unit,
      category
    );
    const doc = await sqlGet(
      "SELECT id, item_name, unit, category FROM items WHERE id = ?",
      id
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
      "items POST",
      "Could not create the item. Please try again."
    );
  }
}
