import mongoose from "mongoose";

const uri =
"mongodb+srv://saadkust5481_db_user:techmart123@techmartadmin.eu33efe.mongodb.net/techmart?retryWrites=true&w=majority&appName=techmartadmin";

try {
  await mongoose.connect(uri);
  console.log("✅ Connected Successfully!");
} catch (error) {
  console.error("❌ Connection Failed:");
  console.error(error);
}

process.exit();