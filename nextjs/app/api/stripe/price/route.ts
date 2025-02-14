import { NextResponse } from "next/server";
import stripe from "@/lib/StripeClient";
import logger from "@/utils/logger";

export async function GET() {
  try {
    const price = await stripe.prices.retrieve(
      process.env.STRIPE_PRICE_ID as string
    );

    logger.debug("Retrieved price details", {
      component: "api",
      action: "getPrice",
      priceId: price.id
    });

    return NextResponse.json(price);
  } catch (error) {
    logger.error(
      "Failed to retrieve price",
      error instanceof Error ? error : new Error(String(error)),
      {
        component: "api",
        action: "getPrice"
      }
    );

    return NextResponse.json(
      { error: "Failed to retrieve price" },
      { status: 500 }
    );
  }
}
