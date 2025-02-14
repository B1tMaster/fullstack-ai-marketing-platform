import { relations } from "drizzle-orm";
import {
  text,
  pgTable,
  uuid,
  timestamp,
  varchar,
  bigint,
  integer,
  boolean,
} from "drizzle-orm/pg-core";

export const projectsTable = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  userId: varchar("user_id", { length: 50 }).notNull(),
});

export const projectsRelations = relations(projectsTable, ({ many }) => ({
  assets: many(assetTable),
  prompts: many(promptsTable),
  generatedContent: many(generatedContentTable),
}));

export const templatesTable = pgTable("templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  isPublic: boolean("is_public").notNull().default(false),
  userId: varchar("user_id", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const templatesRelations = relations(templatesTable, ({ many }) => ({
  templatePrompts: many(templatePromptsTable),
}));

export const assetTable = pgTable("assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projectsTable.id, {
      onDelete: "cascade",
    }),
  title: text("title").notNull(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: varchar("file_type", { length: 50 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  size: bigint("size", { mode: "number" }).notNull(),
  content: text("content").default(""),
  tokenCount: integer("token_count").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const assetRelations = relations(assetTable, ({ one }) => ({
  project: one(projectsTable, {
    fields: [assetTable.projectId],
    references: [projectsTable.id],
  }),
}));

export const assetProcessingJobTable = pgTable("asset_processing_jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  assetId: uuid("asset_id")
    .notNull()
    .unique()
    .references(() => assetTable.id, { onDelete: "cascade" }),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projectsTable.id, { onDelete: "cascade" }),
  status: text("status").notNull(),
  errorMessage: text("error_message"),
  attempts: integer("attempts").notNull().default(0),
  lastHeartBeat: timestamp("last_heart_beat").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const assetProcessingJobRelations = relations(
  assetProcessingJobTable,
  ({ one }) => ({
    asset: one(assetTable, {
      fields: [assetProcessingJobTable.assetId],
      references: [assetTable.id],
    }),
    project: one(projectsTable, {
      fields: [assetProcessingJobTable.projectId],
      references: [projectsTable.id],
    }),
  })
);

export const promptsTable = pgTable("prompts", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projectsTable.id, {
      onDelete: "cascade",
    }),
  name: text("name").notNull(),
  prompt: text("prompt"),
  tokenCount: integer("token_count").default(0),
  order: integer("order").notNull(), // Future us will add in re-order
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const promptRelations = relations(promptsTable, ({ one }) => ({
  project: one(projectsTable, {
    fields: [promptsTable.projectId],
    references: [projectsTable.id],
  }),
}));

export const templatePromptsTable = pgTable("template_prompts", {
  id: uuid("id").defaultRandom().primaryKey(),
  templateId: uuid("template_id")
    .notNull()
    .references(() => templatesTable.id, {
      onDelete: "cascade",
    }),
  name: text("name").notNull(),
  prompt: text("prompt"),
  tokenCount: integer("token_count").default(0),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const templatePromptRelations = relations(
  templatePromptsTable,
  ({ one }) => ({
    template: one(templatesTable, {
      fields: [templatePromptsTable.templateId],
      references: [templatesTable.id],
    }),
  })
);

export const generatedContentTable = pgTable("generated_content", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projectsTable.id, {
      onDelete: "cascade",
    }),
  name: text("name").notNull(),
  result: text("result").notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const GeneratedContentRelations = relations(
  generatedContentTable,
  ({ one }) => ({
    project: one(projectsTable, {
      fields: [generatedContentTable.projectId],
      references: [projectsTable.id],
    }),
  })
);

export const stripeCustomersTable = pgTable("stripe_customers", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: varchar("user_id", { length: 50 }).notNull().unique(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 100 })
    .notNull()
    .unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const subscriptionsTable = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: varchar("user_id", { length: 50 }).notNull(),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 100 })
    .notNull()
    .unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});


// Types
export type InsertProject = typeof projectsTable.$inferInsert;
export type Project = typeof projectsTable.$inferSelect;
export type Asset = typeof assetTable.$inferSelect;
export type InsertAsset = typeof assetTable.$inferInsert;
export type AssetProcessingJob = typeof assetProcessingJobTable.$inferSelect;
export type InsertAssetProcessingJob =
  typeof assetProcessingJobTable.$inferInsert;
export type Prompt = typeof promptsTable.$inferSelect;
export type InsertPrompt = typeof promptsTable.$inferInsert;
export type Template = typeof templatesTable.$inferSelect;
export type InsertTemplate = typeof templatesTable.$inferInsert;
export type TemplatePrompt = typeof templatePromptsTable.$inferSelect;
export type InsertTemplatePrompt = typeof templatePromptsTable.$inferInsert;
export type GeneratedContent = typeof generatedContentTable.$inferSelect;
export type InsertGeneratedContent = typeof generatedContentTable.$inferInsert;
export type StripeCustomer = typeof stripeCustomersTable.$inferSelect;
export type InsertStripeCustomer = typeof stripeCustomersTable.$inferInsert;
export type Subscription = typeof subscriptionsTable.$inferSelect;
export type InsertSubscription = typeof subscriptionsTable.$inferInsert;
