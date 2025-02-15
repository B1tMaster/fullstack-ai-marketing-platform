import Stripe from "stripe";
import logger from "@/utils/logger";

if (!process.env.STRIPE_SECRET_KEY) {
  logger.error("Missing STRIPE_SECRET_KEY environment variable", undefined, {
    component: "stripe",
    action: "initialization",
  });
  throw new Error("Missing STRIPE_SECRET_KEY environment variable");
}

// Initialize Stripe with the latest API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-01-27.acacia", // Latest stable API version
  typescript: true,
});

export default stripe;
