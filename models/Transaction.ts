import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  amount: Number,
  timestamp: String,
  to: String,
  type: String,
});

const Transactions =
  mongoose.models.Transactions ||
  mongoose.model("Transaction", TransactionSchema);

export default Transactions;
