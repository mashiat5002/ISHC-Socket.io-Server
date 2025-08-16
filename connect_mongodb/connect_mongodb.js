const  mongoose = require("mongoose");
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI  || "mongodb://localhost:27017/test";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

const cached = (global ).mongooseCache || { conn: null, promise: null };

 async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI);
  }

  cached.conn = await cached.promise;
  (global ).mongooseCache = cached;
  
  return cached.conn;
}
module.exports = { connectToDatabase };