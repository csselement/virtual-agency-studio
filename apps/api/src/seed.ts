import { loadConfig } from "./config";
import { migrateDatabase, openDatabase } from "./db/database";
import { seedDemoData } from "./db/repositories";
import { ensureStorage } from "./storage";

const config = loadConfig();
ensureStorage(config);

const db = openDatabase({ databaseUrl: config.databaseUrl });
migrateDatabase(db);
const result = seedDemoData(db);
db.close();

console.log(JSON.stringify(result, null, 2));
