import { NextRequest, NextResponse } from "next/server";
import stripe from "@/lib/StripeClient";
import { getOrCreateStripeCustomer } from "@/server/queries";
import logger from "@/utils/logger";
import { clerkClient, getAuth } from "@clerk/nextjs/server";
/**
 * Creates a Stripe Checkout Session for new subscriptions
 * Called when a user clicks the "Subscribe Now" button
 * Returns a URL to Stripe's hosted checkout page
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      logger.error(
        "Unauthorized request to create checkout session",
        undefined,
        {
          component: "api",
          action: "createCheckoutSession",
        }
      );
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.STRIPE_PRICE_ID) {
      logger.error("Missing STRIPE_PRICE_ID", undefined, {
        component: "api",
        action: "createCheckoutSession",
      });
      return NextResponse.json(
        { error: "Stripe price ID not configured" },
        { status: 500 }
      );
    }

    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const email = user.emailAddresses[0]?.emailAddress;
    const customerId = await getOrCreateStripeCustomer(userId, email);

    logger.debug("Creating checkout session", {
      component: "api",
      action: "createCheckoutSession",
      userId,
      customerId,
    });

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.APP_URL}/settings?success=true`,
      cancel_url: `${process.env.APP_URL}/settings?canceled=true`,
      client_reference_id: userId,
    });

    logger.debug("Created checkout session", {
      component: "api",
      action: "createCheckoutSession",
      sessionId: session.id,
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (error) {
    logger.error(
      "Failed to create checkout session",
      error instanceof Error ? error : new Error(String(error)),
      {
        component: "api",
        action: "createCheckoutSession",
      }
    );

    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
