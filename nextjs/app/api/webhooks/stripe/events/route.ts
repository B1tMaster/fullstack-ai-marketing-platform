import { NextRequest, NextResponse } from "next/server";
import { HttpStatus } from "@/constants/http";
import { headers } from "next/headers";
import stripe from "@/lib/StripeClient";
import { db } from "@/server/db";
import { subscriptionsTable } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import logger from "@/utils/logger";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = (await headers()).get("stripe-signature");

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    logger.error("Missing STRIPE_WEBHOOK_SECRET", undefined, {
      component: "webhook",
      action: "verification",
    });
    return new NextResponse(
      "Webhook secret not configured", 
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }

  if (!sig) {
    return new NextResponse(
      "No signature found", 
      { status: HttpStatus.BAD_REQUEST }
    );
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    logger.debug("Webhook signature verified", {
      component: "webhook",
      action: "verification",
      eventType: event.type
    });

    logger.debug("Received Stripe webhook", {
      component: "webhook",
      action: "process",
      type: event.type,
    });

    // Handle subscription events
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.userId;

        if (!userId) {
          logger.error("No userId in metadata", undefined, {
            component: "webhook",
            action: "subscription.update",
            subscriptionId: subscription.id,
          });
          return new NextResponse(
            "No userId found", 
            { status: HttpStatus.BAD_REQUEST }
          );
        }

        logger.debug("Processing subscription event", {
          component: "webhook",
          action: "subscription.update",
          subscriptionId: subscription.id,
          userId,
          status: subscription.status
        });

        // Handle subscription based on status
        switch (subscription.status) {
          case 'active':
          case 'past_due':
          case 'trialing':
            // Save or update subscription
            await db
              .insert(subscriptionsTable)
              .values({
                userId,
                stripeSubscriptionId: subscription.id,
              })
              .onConflictDoUpdate({
                target: [subscriptionsTable.stripeSubscriptionId],
                set: {
                  userId,
                },
              });

            logger.debug("Saved subscription to database", {
              component: "webhook",
              action: "subscription.save",
              subscriptionId: subscription.id,
              userId,
              status: subscription.status
            });
            break;

          case 'incomplete':
            // Save but log warning
            await db
              .insert(subscriptionsTable)
              .values({
                userId,
                stripeSubscriptionId: subscription.id,
              })
              .onConflictDoUpdate({
                target: [subscriptionsTable.stripeSubscriptionId],
                set: {
                  userId,
                },
              });

            logger.warn("Subscription payment incomplete", {
              component: "webhook",
              action: "subscription.incomplete",
              subscriptionId: subscription.id,
              userId
            });
            break;

          case 'incomplete_expired':
          case 'canceled':
          case 'unpaid':
          case 'paused':
            // Remove subscription from database
            await db
              .delete(subscriptionsTable)
              .where(eq(subscriptionsTable.stripeSubscriptionId, subscription.id));

            logger.debug("Removed subscription from database", {
              component: "webhook",
              action: "subscription.remove",
              subscriptionId: subscription.id,
              userId,
              status: subscription.status
            });
            break;

          default:
            logger.warn("Unhandled subscription status", {
              component: "webhook",
              action: "subscription.unknown",
              subscriptionId: subscription.id,
              userId,
              status: subscription.status
            });
        }

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        // Remove subscription from our database
        await db
          .delete(subscriptionsTable)
          .where(eq(subscriptionsTable.stripeSubscriptionId, subscription.id));

        break;
      }
    }

    return new NextResponse(null, { status: HttpStatus.OK });
  } catch (error) {
    logger.error(
      "Error processing webhook",
      error instanceof Error ? error : new Error(String(error)),
      {
        component: "webhook",
        action: "process",
      }
    );
    return new NextResponse(
      "Webhook error: " + (error instanceof Error ? error.message : "Unknown error"),
      { status: HttpStatus.BAD_REQUEST }
    );
  }
}
