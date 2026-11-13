// Optional: override DNS servers (fixes "querySrv ECONNREFUSED" on some networks)
if (process.env.DNS_SERVERS) require('dns').setServers(process.env.DNS_SERVERS.split(','));

const mongoose = require('mongoose');
const AppError = require('../utils/AppError');

// Cache the connection on `global` so serverless invocations reuse it.
const cache = global._mongoose || (global._mongoose = { conn: null, promise: null });

async function connectDb() {
  if (!process.env.MONGODB_URI) throw new AppError(500, 'MONGODB_URI is not configured on the server');
  if (cache.conn) return cache.conn;
  if (!cache.promise) {
    cache.promise = mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
    });
  }
  try {
    cache.conn = await cache.promise;
  } catch (err) {
    cache.promise = null;
    console.error('Mongo connection failed:', err.message);
    throw new AppError(503, 'Could not connect to the database');
  }
  return cache.conn;
}

const dbMiddleware = (req, res, next) => connectDb().then(() => next()).catch(next);

module.exports = { connectDb, dbMiddleware };