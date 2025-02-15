import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { HttpStatus } from "@/lib/http-status";
import stripe from "@/lib/StripeClient";
import { db } from "@/server/db";
import { stripeCustomersTable } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import logger from "@/utils/logger";

/**
 * Creates a Stripe Customer Portal Session for subscription management
 * Called when a user clicks the "Manage Subscription" button
 * Returns a URL to Stripe's hosted customer portal
 */
export async function POST(request: NextRequest) {
  try {
    // Auth check
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: HttpStatus.UNAUTHORIZED }
      );
    }

    const baseUrl = process.env.APP_URL;
    if (!baseUrl) {
      logger.error("Missing APP_URL environment variable", undefined, {
        component: "api",
        action: "createPortalSession"
      });
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: HttpStatus.INTERNAL_SERVER_ERROR }
      );
    }

    // Find existing customer
    const customer = await db.query.stripeCustomersTable.findFirst({
      where: eq(stripeCustomersTable.userId, userId),
    });

    if (!customer) {
      logger.error("Customer not found", undefined, {
        component: "api",
        action: "createPortalSession",
        userId
      });
      return NextResponse.json(
        { error: "Customer not found" },
        { status: HttpStatus.NOT_FOUND }
      );
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customer.stripeCustomerId,
      return_url: `${baseUrl}/settings`,
    });

    logger.debug("Created portal session", {
      component: "api",
      action: "createPortalSession",
      sessionId: session.id,
      customerId: customer.stripeCustomerId
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
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}
