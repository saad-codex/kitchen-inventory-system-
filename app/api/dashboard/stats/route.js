import { sqlGet, sqlAll } from "@/lib/sqlite";
import { getUserIdFromRequest } from "@/lib/auth";
import {
  MSG_UNAUTHORIZED,
  CODE_UNAUTHORIZED,
  jsonError,
  respondWithError,
} from "@/lib/api-errors";

const LOW_STOCK_THRESHOLD = 10;

export async function GET(request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return jsonError(MSG_UNAUTHORIZED, 401, CODE_UNAUTHORIZED);
    }

    let itemCount = 0;
    let kitchenCount = 0;
    let inventoryRows = [];
    try {
      const [ic, kc, ir] = await Promise.all([
        sqlGet(
          "SELECT COUNT(*) AS c FROM items WHERE user_id = ?",
          userId
        ),
        sqlGet(
          "SELECT COUNT(*) AS c FROM kitchens WHERE user_id = ?",
          userId
        ),
        sqlAll(
          "SELECT quantity FROM inventory WHERE user_id = ?",
          userId
        ),
      ]);
      itemCount = Number(ic?.c) || 0;
      kitchenCount = Number(kc?.c) || 0;
      inventoryRows = ir || [];
    } catch (dbErr) {
      return respondWithError(
        dbErr,
        "dashboard/stats query",
        "Could not load dashboard statistics from the database."
      );
    }

    const totalUnits = inventoryRows.reduce(
      (s, r) => s + (Number(r.quantity) || 0),
      0
    );
    const lowStock = inventoryRows.filter(
      (r) => Number(r.quantity) < LOW_STOCK_THRESHOLD
    ).length;

    return Response.json({
      totalItems: itemCount,
      activeKitchens: kitchenCount,
      lowStock,
      totalOrders: inventoryRows.length,
      totalUnits,
      lowStockThreshold: LOW_STOCK_THRESHOLD,
    });
  } catch (err) {
    return respondWithError(
      err,
      "dashboard/stats",
      "Could not load dashboard statistics."
    );
  }
}
