import { NextRequest, NextResponse } from "next/server";
import stripe from "@/lib/StripeClient";
import { getOrCreateStripeCustomer } from "@/server/queries";
import logger from "@/utils/logger";

/**
 * Creates a Stripe Customer Portal Session for subscription management
 * Called when a user clicks the "Manage Subscription" button
 * Returns a URL to Stripe's hosted customer portal
 */
export async function POST(req: NextRequest) {
  try {
    const customerId = await getOrCreateStripeCustomer();
    
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${req.nextUrl.origin}/settings`,
    });

    logger.debug("Created portal session", {
      component: "api",
      action: "createPortalSession",
      sessionId: session.id
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    logger.error(
      "Failed to create portal session",
      error instanceof Error ? error : new Error(String(error)),
      {
        component: "api",
        action: "createPortalSession"
      }
    );

    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
