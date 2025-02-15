"server-only";

import { auth } from "@clerk/nextjs/server";
import { db } from "./db";
import {
  Project,
  projectsTable,
  Template,
  templatesTable,
  stripeCustomersTable,
  subscriptionsTable,
} from "./db/schema";
import { eq } from "drizzle-orm";
import stripe from "@/lib/StripeClient";
import logger from "@/utils/logger";
import Stripe from "stripe";

export async function getProjectsForUser(): Promise<Project[]> {
  // Figure out who the user is
  const { userId } = await auth();

  // Verify the user exists
  if (!userId) {
    throw new Error("User not found");
  }

  // Fetch projects from database
  const projects = db.query.projectsTable.findMany({
    where: eq(projectsTable.userId, userId),
    orderBy: (projects, { desc }) => [desc(projects.updatedAt)],
  });

  return projects;
}

export async function getProject(projectId: string) {
  // Figure out who the user is
  const { userId } = await auth();

  // Verify the user exists
  if (!userId) {
    throw new Error("User not found");
  }

  const project = await db.query.projectsTable.findFirst({
    where: (project, { eq, and }) =>
      and(eq(project.id, projectId), eq(project.userId, userId)),
  });

  return project;
}

export async function getTemplatesForUser(): Promise<Template[]> {
  // Figure out who the user is

  const { userId } = await auth();
  // Verify the user exists
  if (!userId) {
    throw new Error("User not found");
  }

  // Fetch templates from database
  const templates = await db.query.templatesTable.findMany({
    where: eq(templatesTable.userId, userId),
    orderBy: (templates, { desc }) => [desc(templates.updatedAt)],
  });

  return templates;
}

export async function getTemplate(id: string): Promise<Template | undefined> {
  // Figure out who the user is

  const { userId } = await auth();
  // Verify the user exists
  if (!userId) {
    throw new Error("User not found");
  }

  const template = await db.query.templatesTable.findFirst({
    where: (template, { eq, and }) =>
      and(eq(template.id, id), eq(template.userId, userId)),
  });

  return template;
}

export async function getUserSubscription(): Promise<Stripe.Subscription | null> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not found");
  }

  try {
    // Get subscription from our database
    const dbSubscription = await db.query.subscriptionsTable.findFirst({
      where: eq(subscriptionsTable.userId, userId),
    });

    if (!dbSubscription?.stripeSubscriptionId) {
      logger.debug("No existing subscription found for user", {
        component: "queries",
        action: "getUserSubscription",
        userId,
      });
      return null;
    }

    // Get full subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(
      dbSubscription.stripeSubscriptionId
    );

    // Only return active or past_due subscriptions
    if (
      subscription.status !== "active" &&
      subscription.status !== "past_due"
    ) {
      logger.debug("Subscription exists but is not active", {
        component: "queries",
        action: "getUserSubscription",
        userId,
        status: subscription.status,
      });
      return null;
    }

    logger.debug("Retrieved user subscription", {
      component: "queries",
      action: "getUserSubscription",
      subscriptionId: subscription.id,
      status: subscription.status,
    });

    return JSON.parse(JSON.stringify(subscription));
  } catch (error) {
    // Only log as error if it's a real error, not an expected case
    if (error instanceof Error && !error.message.includes("does not exist")) {
      logger.error(
        "Failed to get user subscription",
        error instanceof Error ? error : new Error(String(error)),
        {
          component: "queries",
          action: "getUserSubscription",
          userId,
        }
      );
    }
    return null;
  }
}

export async function getOrCreateStripeCustomer(
  userId: string,
  email: string
): Promise<string> {
  if (!userId) {
    throw new Error("User not found");
  }

  try {
    // Check if customer already exists
    const existingCustomer = await db.query.stripeCustomersTable.findFirst({
      where: eq(stripeCustomersTable.userId, userId),
    });

    if (existingCustomer?.stripeCustomerId) {
      return existingCustomer.stripeCustomerId;
    }

    // Create new customer in Stripe
    const customer = await stripe.customers.create({
      email: email,
      metadata: {
        userId: userId,
      },
    });

    // Store customer in database
    await db.insert(stripeCustomersTable).values({
      userId,
      stripeCustomerId: customer.id,
    });

    logger.debug("Created new Stripe customer", {
      component: "queries",
      action: "getOrCreateStripeCustomer",
      customerId: customer.id,
    });

    return customer.id;
  } catch (error) {
    logger.error(
      "Failed to get/create Stripe customer",
      error instanceof Error ? error : new Error(String(error)),
      {
        component: "queries",
        action: "getOrCreateStripeCustomer",
        userId,
      }
    );
    throw error;
  }
}
