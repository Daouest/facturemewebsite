import mongoose, { Mongoose } from "mongoose";
//doc pour la connection d'une db avec mongoose
//source : https://mongoosejs.com/docs/connections.html

//facon de destructurer l'obejet afin de rendre le code plus clair
//c'est surtout pour ne pas avoir toujours à êcrire "process.env"

//sert à voir les console logs de Mongo
if (process.env.NODE_ENV !== "production") {
  //mongoose.set("debug", { shell: true });
}

const { MONGODB_URI } = process.env;

if (!MONGODB_URI) {
  throw new Error("Veuillez definir la variable MONGODB_URI");
}

const EFFECTIVE_DB = "FactureMe";

declare global {
  var _mongoose:
    | { conn: Mongoose | null; promise: Promise<Mongoose> | null }
    | undefined;
}

let cached = globalThis._mongoose

if (!cached) {
  cached = globalThis._mongoose = { conn: null, promise: null }
}

export async function connectToDatabase(): Promise<Mongoose> {
  if (cached!.conn) {
    if (process.env.NODE_ENV !== "production") {
      console.log("Déjà connecté à la base de données");
    }
    return cached!.conn;
  }

  if (!cached!.promise) {
    cached!.promise = mongoose.connect(MONGODB_URI!, {
      dbName: EFFECTIVE_DB,
      autoIndex: process.env.NODE_ENV !== "production",
    })
  }

  try {
    cached!.conn = await cached!.promise

    if (process.env.NODE_ENV !== "production") {
      console.log(`Connecting to (db="${mongoose.connection.name})`)
    }

    return cached!.conn

  } catch (error) {
    cached!.promise = null
    throw error;
  }
}

