import { db } from "./index";
import { customers } from "./schema";

await db.insert(customers).values([
    { customerId: "C101", name: "John Doe", email: "john.doe@example.com" },
    { customerId: "C102", name: "Jane Smith", email: "jane.smith@example.com" },
    { customerId: "C103", name: "Bob Brown", email: "bob.brown@example.com" },
]).onConflictDoNothing();

console.log("Seeded customers");
process.exit(0);