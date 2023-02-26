import mongoose from "mongoose";

interface IUser {
  name: string;
  googleId: string;
  profile_img: string;
  transactions: mongoose.Schema.Types.Array;
}

const UserSchema = new mongoose.Schema<IUser>({
  name: String,
  googleId: String,
  profile_img: String,
  transactions: mongoose.Schema.Types.Array,
});

const Users =
  (mongoose.models.User as mongoose.Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);
export default Users;
