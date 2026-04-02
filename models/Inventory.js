import mongoose from "mongoose";

const InventorySchema = new mongoose.Schema({

  kitchen_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Kitchen"
  },

  item_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item"
  },

  quantity: Number,

  price_per_unit: Number,

  total_price: Number,

  created_at: {
    type: Date,
    default: Date.now
  }

});

export default mongoose.models.Inventory || mongoose.model("Inventory", InventorySchema);