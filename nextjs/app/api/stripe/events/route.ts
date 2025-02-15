import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import stripe from "@/lib/StripeClient";
import { db } from "@/server/db";
import { subscriptionsTable } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import logger from "@/utils/logger";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = headers().get("stripe-signature");

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    logger.error("Missing STRIPE_WEBHOOK_SECRET", undefined, {
      component: "webhook",
      action: "verification",
    });
    return new NextResponse("Webhook secret not configured", { status: 500 });
  }

  if (!sig) {
    return new NextResponse("No signature found", { status: 400 });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

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
        const userId = subscription.metadata.userId || subscription.client_reference_id;

        if (!userId) {
          logger.error("No userId in metadata or client_reference_id", undefined, {
            component: "webhook",
            action: "subscription.update",
            subscriptionId: subscription.id,
          });
          return new NextResponse("No userId found", { status: 400 });
        }

        // Upsert subscription record
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

    return new NextResponse(null, { status: 200 });
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
      { status: 400 }
    );
  }
}
