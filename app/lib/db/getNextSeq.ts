import mongoose from "mongoose";
import { connectToDatabase } from "./mongodb";

type CounterDoc = { _id: string; seq: number }

//en gros c'est une facon d'auto-incrementer dans mongoDB
//source : https://www.mongodb.com/resources/products/platform/mongodb-auto-increment

export async function getNextSeq(seqName: string, startAt = 1): Promise<number> {
    await connectToDatabase()

    const counters = mongoose.connection.collection("counters")
    const res = await counters.findOneAndUpdate(
        { _id: seqName },
        { $inc: { seq: 1 } },
        // [
        //     { $set: { seq: { $add: [{ $ifNull: ["$seq", startAt - 1] }, 1] } } }
        // ],
        { upsert: true, returnDocument: "after" }
    )

    if (!res.value) {
        const doc = await counters.findOne({ _id: seqName })
        if (!doc) throw new Error("Counter missing after upsert")
        return doc.seq
    }
    return res.value!.seq as number
}