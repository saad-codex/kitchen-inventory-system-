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

    const rows = await sqlAll(
      `SELECT id, kitchen_id, item_id, quantity, price_per_unit, total_price, created_at
       FROM inventory WHERE user_id = ? ORDER BY datetime(created_at) DESC`,
      userId
    );
    return Response.json(
      rows.map((doc) => ({
        _id: String(doc.id),
        kitchen_id: String(doc.kitchen_id),
        item_id: String(doc.item_id),
        quantity: doc.quantity,
        price_per_unit: doc.price_per_unit,
        total_price: doc.total_price,
        created_at: doc.created_at,
      }))
    );
  } catch (err) {
    return respondWithError(
      err,
      "inventory GET",
      "Could not load inventory. Please try again later."
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

    const kitchen_id =
      typeof body.kitchen_id === "string" ? body.kitchen_id.trim() : "";
    const item_id =
      typeof body.item_id === "string" ? body.item_id.trim() : "";
    const quantity = body.quantity;
    const price_per_unit = body.price_per_unit;

    if (!kitchen_id) {
      return jsonError(
        "kitchen_id is required (which kitchen this stock belongs to).",
        400,
        "INVENTORY_KITCHEN_ID_REQUIRED"
      );
    }
    if (!item_id) {
      return jsonError(
        "item_id is required (which catalog item this row refers to).",
        400,
        "INVENTORY_ITEM_ID_REQUIRED"
      );
    }
    if (quantity === undefined || quantity === null || quantity === "") {
      return jsonError(
        "quantity is required.",
        400,
        "INVENTORY_QUANTITY_REQUIRED"
      );
    }
    if (
      price_per_unit === undefined ||
      price_per_unit === null ||
      price_per_unit === ""
    ) {
      return jsonError(
        "price_per_unit is required.",
        400,
        "INVENTORY_PRICE_REQUIRED"
      );
    }

    const q = Number(quantity);
    const ppu = Number(price_per_unit);
    if (Number.isNaN(q)) {
      return jsonError(
        "quantity must be a valid number.",
        400,
        "INVENTORY_QUANTITY_NAN"
      );
    }
    if (q < 0) {
      return jsonError(
        "quantity cannot be negative.",
        400,
        "INVENTORY_QUANTITY_NEGATIVE"
      );
    }
    if (Number.isNaN(ppu)) {
      return jsonError(
        "price_per_unit must be a valid number.",
        400,
        "INVENTORY_PRICE_NAN"
      );
    }
    if (ppu < 0) {
      return jsonError(
        "price_per_unit cannot be negative.",
        400,
        "INVENTORY_PRICE_NEGATIVE"
      );
    }

    const total_price = Math.round(q * ppu * 100) / 100;

    const [kitchen, item] = await Promise.all([
      sqlGet(
        "SELECT id FROM kitchens WHERE id = ? AND user_id = ?",
        kitchen_id,
        userId
      ),
      sqlGet(
        "SELECT id FROM items WHERE id = ? AND user_id = ?",
        item_id,
        userId
      ),
    ]);

    if (!kitchen && !item) {
      return jsonError(
        "Neither the kitchen nor the item exists for your account. Check kitchen_id and item_id.",
        400,
        "INVENTORY_KITCHEN_AND_ITEM_NOT_FOUND"
      );
    }
    if (!kitchen) {
      return jsonError(
        "No kitchen found with this ID for your account.",
        400,
        "INVENTORY_KITCHEN_NOT_FOUND"
      );
    }
    if (!item) {
      return jsonError(
        "No catalog item found with this ID for your account.",
        400,
        "INVENTORY_ITEM_NOT_FOUND"
      );
    }

    const invId = newId();
    await sqlRun(
      `INSERT INTO inventory (id, user_id, kitchen_id, item_id, quantity, price_per_unit, total_price)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      invId,
      userId,
      kitchen_id,
      item_id,
      q,
      ppu,
      total_price
    );
    const doc = await sqlGet(
      `SELECT id, kitchen_id, item_id, quantity, price_per_unit, total_price, created_at
       FROM inventory WHERE id = ?`,
      invId
    );

    return Response.json({
      _id: String(doc.id),
      kitchen_id: String(doc.kitchen_id),
      item_id: String(doc.item_id),
      quantity: doc.quantity,
      price_per_unit: doc.price_per_unit,
      total_price: doc.total_price,
      created_at: doc.created_at,
    });
  } catch (err) {
    return respondWithError(
      err,
      "inventory POST",
      "Could not create this inventory row."
    );
  }
}
