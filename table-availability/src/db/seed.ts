import { db } from "./index";
import { tables } from "./schema";

await db.insert(tables).values([
    { tableId: "T001", capacity: 4, location: "Window", available: true },
    { tableId: "T002", capacity: 2, location: "Corner", available: false },
    { tableId: "T003", capacity: 6, location: "Center", available: true },
    { tableId: "T004", capacity: 8, location: "Balcony", available: false },
]).onConflictDoNothing();

console.log("Seeded tables");
process.exit(0);