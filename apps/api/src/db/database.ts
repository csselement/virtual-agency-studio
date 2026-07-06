import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { additiveColumnStatements, schemaStatements } from "./schema";

export interface DatabaseOptions {
  databaseUrl: string;
}

export type AppDatabase = DatabaseSync;

export function openDatabase(options: DatabaseOptions): AppDatabase {
  const databasePath = resolve(options.databaseUrl);
  mkdirSync(dirname(databasePath), { recursive: true });

  const db = new DatabaseSync(databasePath);
  db.exec("pragma foreign_keys = on");
  return db;
}

export function migrateDatabase(db: AppDatabase) {
  db.exec("begin");
  try {
    for (const statement of schemaStatements) {
      db.exec(statement);
    }
    for (const column of additiveColumnStatements) {
      const existing = db.prepare(`pragma table_info(${column.table})`).all() as Array<{ name: string }>;
      if (!existing.some((item) => item.name === column.column)) {
        db.exec(column.statement);
      }
    }
    db.exec("commit");
  } catch (error) {
    db.exec("rollback");
    throw error;
  }
}
