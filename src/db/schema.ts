import { integer, pgTable, unique, varchar } from 'drizzle-orm/pg-core';

export const usersTable = pgTable(
  'users',
  {
    id: integer()
      .primaryKey()
      .generatedAlwaysAsIdentity({ name: 'users_id_seq' }),
    name: varchar({ length: 255 }).notNull(),
    age: integer().notNull(),
    email: varchar({ length: 255 }).notNull(),
  },
  (table) => [unique('users_email_unique').on(table.email)],
);
