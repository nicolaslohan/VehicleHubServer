import { pgTable, text, timestamp, bigserial, boolean, bigint } from 'drizzle-orm/pg-core'

export const companies = pgTable('companies', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    name: text('name').notNull(),
    document: text('document').unique().notNull(),
    contact: text('contact').notNull(),
    email: text('email').notNull(),
    created_by: bigint('created_by', { mode: 'number' }).notNull(),
    modified_by: bigint('modified_by', { mode: 'number' }).notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    modified_at: timestamp('modified_at'),
    deleted: boolean('deleted').default(false).notNull()
})

// Table companies {
// 	id bigserial [ pk, not null, unique ]
// 	name varchar [ not null ]
// 	document varchar [ not null, unique ]
// 	contact varchar [ not null ]
// 	email varchar [ not null ]
// 	created_by bigint [ not null ]
// 	modified_by bigint [ not null ]
// 	created_at timestamp [ not null, default: CURRENT_TIMESTAMP ]
// 	modified_at timestamp
// 	deleted boolean [ not null, default: FALSE ]
// }