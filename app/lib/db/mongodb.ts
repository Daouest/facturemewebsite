import "server-only"
import mongoose, { Mongoose } from "mongoose";
import { requireMongoEnv } from "@/app/lib/schemas/env";

//doc pour la connection d'une db avec mongoose
//source : https://mongoosejs.com/docs/connections.html

//facon de destructurer l'obejet afin de rendre le code plus clair
//c'est surtout pour ne pas avoir toujours à êcrire "process.env"

//sert à voir les console logs de Mongo
if (process.env.NODE_ENV !== "production") {
  //mongoose.set("debug", { shell: true });
}

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache:
    | { conn: Mongoose | null; promise: Promise<Mongoose> | null }
    | undefined;
}
const cached =
  (globalThis as any)._mongooseCache ??
  ((globalThis as any)._mongooseCache = { conn: null, promise: null });

export async function connectToDatabase(): Promise<Mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const { MONGODB_URI, MONGODB_DB_NAME, NODE_ENV } = requireMongoEnv(); // <- validate here
    const autoIndex = NODE_ENV !== "production";

    cached.promise = mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB_NAME, autoIndex }).then((m) => {
      if (NODE_ENV !== "production") console.log(`Connected to MongoDB (db="${m.connection.name}")`);
      return m;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}