
import mongoose from "mongoose";
import type { Collection, ModifyResult, Document } from "mongodb";
import { connectToDatabase } from "./mongodb";

//en gros c'est une facon d'auto-incrementer dans mongoDB
//source : https://www.mongodb.com/resources/products/platform/mongodb-auto-increment

type CounterDoc = { _id: string; seq: number };

/**
 * Auto-increment helper for MongoDB counters.
 * Keeps using Mongoose connection + native collection (your original setup).
 * Avoids "ConflictingUpdateOperators" by using an aggregation pipeline update.
 */
export async function getNextSeq(seqName: string, startAt = 1): Promise<number> {
    await connectToDatabase();

    const db = mongoose.connection.db;
    if (!db) {
        throw new Error("Erreur lors de la connexion avec la DB");
    }

    const counters: Collection<CounterDoc> = db.collection<CounterDoc>("counters");

    // Use a pipeline so we can set seq = (ifNull(seq, startAt-1)) + 1
    const updatePipeline: Document[] = [
        {
            $set: {
                seq: { $add: [{ $ifNull: ["$seq", startAt - 1] }, 1] },
            },
        },
    ];

    const result: ModifyResult<CounterDoc> = await counters.findOneAndUpdate(
        { _id: seqName },
        updatePipeline as any, // pipeline updates are valid, TS casts to any for driver types
        {
            upsert: true,
            returnDocument: "after",
        }
    );

    const doc = result.value;
    if (!doc || typeof doc.seq !== "number") {
        // Fallback: if something odd happens, return startAt
        return startAt;
    }
    return doc.seq;
}
