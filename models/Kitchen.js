import mongoose from "mongoose";

const KitchenSchema = new mongoose.Schema({
  kitchen_name: String,
  location: String
});

export default mongoose.models.Kitchen || mongoose.model("Kitchen", KitchenSchema);