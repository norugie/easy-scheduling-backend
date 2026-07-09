import { eq } from "drizzle-orm";
import { db, pool } from "./index.js";
import { users } from "./schema.js";
import { hashPassword } from "../services/password.service.js";

const seededUser = {
  name: "Richard Anderson",
  username: "hr.anderson",
  password: "password",
  email: "3900@cmsd.bc.ca",
  phoneNumber: "+12506414384",
};

const passwordHash = await hashPassword(seededUser.password);
const [existing] = await db
  .select()
  .from(users)
  .where(eq(users.username, seededUser.username));

if (existing) {
  await db
    .update(users)
    .set({
      name: seededUser.name,
      passwordHash,
      email: seededUser.email,
      phoneNumber: seededUser.phoneNumber,
      updatedAt: new Date(),
    })
    .where(eq(users.id, existing.id));
} else {
  await db.insert(users).values({
    name: seededUser.name,
    username: seededUser.username,
    passwordHash,
    email: seededUser.email,
    phoneNumber: seededUser.phoneNumber,
  });
}

await pool.end();
