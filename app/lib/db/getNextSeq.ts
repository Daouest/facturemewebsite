import mongoose from "mongoose";
import type { Collection, UpdateFilter, WithId } from "mongodb";
import { connectToDatabase } from "./mongodb";

type CounterDoc = { _id: string; seq: number }

//en gros c'est une facon d'auto-incrementer dans mongoDB
//source : https://www.mongodb.com/resources/products/platform/mongodb-auto-increment

export async function getNextSeq(seqName: string, startAt = 1): Promise<number> {
    await connectToDatabase()

    const db = mongoose.connection.db
    if (!db) {
        throw new Error("Erreur lors de la connexion dans avec la DB")
    }

    const counters: Collection<CounterDoc> = db.collection<CounterDoc>("counters")

    const update: UpdateFilter<CounterDoc> = {
        $inc: { seq: 1 },
        $setOnInsert: { seq: startAt - 1 },
    }

    const doc: WithId<CounterDoc> | null = await counters.findOneAndUpdate(
        { _id: seqName },
        update,
        {
            upsert: true,
            returnDocument: "after",
            includeResultMetadata: false,
        }
    )
    return doc?.seq ?? startAt
}