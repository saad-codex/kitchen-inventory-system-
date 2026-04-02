import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema({
  item_name: String,
  unit: String
});

export default mongoose.models.Item || mongoose.model("Item", ItemSchema);