/** * Generic sequence generator for MongoDB auto-incrementing IDs * Replaces 7 nearly identical fetchNext*Id functions */ import { Model } from "mongoose";
/** * Generic function to get the next available ID for any entity * @param model - The Mongoose model to query * @param idField - The name of the ID field (e.g., 'idFacture', 'idClient') * @returns The next available ID (last ID + 1, or 1 if no records exist) *  * @example * const nextFactureId = await getNextId(DbFacture, 'idFacture'); * const nextClientId = await getNextId(DbClient, 'idClient'); */ export async function getNextId<
  T,
>(model: Model<T>, idField: string): Promise<number> {
  const sortQuery = { [idField]: -1 } as any;
  const lastRecord = await model.findOne().sort(sortQuery).lean<any>();
  return lastRecord ? lastRecord[idField] + 1 : 1;
}
/** * Creates a sequence generator function for a specific model and field * Useful for creating dedicated functions with better type safety *  * @example * export const fetchNextFactureId = createSequenceGenerator(DbFacture, 'idFacture'); * export const fetchNextClientId = createSequenceGenerator(DbClient, 'idClient'); */ export function createSequenceGenerator<
  T,
>(model: Model<T>, idField: string): () => Promise<number> {
  return () => getNextId(model, idField);
}
