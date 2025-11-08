import type { Collection, ModifyResult, Document, WithId } from "mongodb";
//en gros c'est une facon d'auto-incrementer dans mongoDB
//source : https://www.mongodb.com/resources/products/platform/mongodb-auto-increment

export type CounterDoc = { _id: string; seq: number };

/**
 * Auto-increment helper for MongoDB counters.
 * Keeps using Mongoose connection + native collection (your original setup).
 * Avoids "ConflictingUpdateOperators" by using an aggregation pipeline update.
 */

export async function getNextSeq(
    counters: Collection<CounterDoc>,
    seqName: string,
    startAt = 1
): Promise<number> {
    const updatePipeline: Document[] = [
        { $set: { seq: { $add: [{ $ifNull: ["$seq", startAt - 1] }, 1] } } },
    ];

    const result: ModifyResult<CounterDoc> = await counters.findOneAndUpdate(
        { _id: seqName },
        updatePipeline as any,
        {
            upsert: true,
            returnDocument: "after",
            includeResultMetadata: true as const, // 👈 forces ModifyResult<T>
        }
    );

    const doc = result.value;
    return doc?.seq ?? startAt;
}
