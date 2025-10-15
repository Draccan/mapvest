import { eq } from "drizzle-orm";

import { hashPassword } from "../src/core/utils/PasswordManager";
import { db } from "../src/db";
import { users } from "../src/db/schema";

const SEED_USER = {
    email: "a@b.com",
    password: "12345678",
    name: "Test",
    surname: "User",
};

async function seed() {
    try {
        const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.email, SEED_USER.email))
            .limit(1);

        if (existingUser.length > 0) {
            return;
        }

        const hashedPassword = await hashPassword(SEED_USER.password);

        await db.insert(users).values({
            email: SEED_USER.email,
            password: hashedPassword,
            name: SEED_USER.name,
            surname: SEED_USER.surname,
        });
    } catch (error) {
        console.error("Error seeding database:", error);
        throw error;
    }
}

seed()
    .then(() => {
        process.exit(0);
    })
    .catch(() => {
        process.exit(1);
    });
