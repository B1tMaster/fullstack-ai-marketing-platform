"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Star, LayoutTemplate, Box } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import axios from "axios";
import toast from "react-hot-toast";

import type { Stripe } from "stripe";
import logger from "@/utils/logger";

interface SubscriptionManagerProps {
  subscription: Stripe.Subscription | null;
}

export default function SubscriptionManager({
  subscription,
}: SubscriptionManagerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [price, setPrice] = useState<string>("");

  useEffect(() => {
    // Fetch price from API
    const fetchPrice = async () => {
      try {
        const response = await axios.get("/api/stripe/price");
        const { unit_amount } = response.data;
        setPrice((unit_amount / 100).toFixed(2));
      } catch (error) {
        logger.error("Failed to fetch price", error instanceof Error ? error : new Error(String(error)), {
          component: "SubscriptionManager",
          action: "fetchPrice"
        });
        setPrice("Failed"); // Fallback price
      }
    };

    fetchPrice();

    // Show success/error messages when returning from Stripe
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("success")) {
      toast.success("Successfully subscribed to premium plan!");
    }
    if (urlParams.get("canceled")) {
      toast.error("Subscription canceled.");
    }
  }, []);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      date: date.toLocaleDateString(),
      daysRemaining: `${diffDays} days remaining`,
    };
  };

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post("/api/stripe/create-checkout-session");
      window.location.href = response.data.url;
    } catch (error) {
      const errorMessage =
        axios.isAxiosError(error) && error.response?.data?.error
          ? error.response.data.error
          : "Failed to start subscription process";
      toast.error(errorMessage);
      logger.error("Subscription error", error instanceof Error ? error : new Error(String(error)), {
        component: "SubscriptionManager",
        action: "handleSubscribe"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post("/api/stripe/create-portal-session");
      window.location.href = response.data.url;
    } catch (error) {
      toast.error("Failed to open subscription management");
      logger.error("Portal session error", error instanceof Error ? error : new Error(String(error)), {
        component: "SubscriptionManager",
        action: "handleManageSubscription"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Subscription Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {subscription ? (
          // Premium Plan View
          <div className="space-y-4">
            <div className="text-lg font-medium">
              Premium Plan
              <span
                className={cn(
                  "ml-2",
                  subscription.status === "active" && "text-green-600",
                  subscription.status === "past_due" && "text-yellow-600",
                  subscription.status === "canceled" && "text-red-600"
                )}
              >
                (
                {subscription.status === "active"
                  ? "Active"
                  : subscription.status === "past_due"
                  ? "Payment Required"
                  : subscription.status === "canceled"
                  ? "Canceled"
                  : subscription.status}
                )
              </span>
            </div>
            {subscription.current_period_end && (
              <div className="text-gray-600">
                Next billing date:{" "}
                {formatDate(subscription.current_period_end).date}
                <div className="text-sm">
                  ({formatDate(subscription.current_period_end).daysRemaining})
                </div>
              </div>
            )}
            <Button
              onClick={handleManageSubscription}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              Manage Subscription
            </Button>
          </div>
        ) : (
          // Free Plan View
          <div className="space-y-6">
            <div className="text-lg font-medium">Free Plan</div>
            <div className="space-y-4">
              <div className="space-y-3">
                <h3 className="text-lg font-medium">
                  Upgrade to Premium to unlock:
                </h3>
                <div className="space-y-2">
                  {[
                    { icon: Star, text: "Unlimited projects" },
                    { icon: LayoutTemplate, text: "Unlimited templates" },
                    { icon: Box, text: "Unlimited storage" },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center space-x-2">
                      <Icon className="h-5 w-5 text-main" />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Button
                onClick={handleSubscribe}
                disabled={isLoading}
                className={cn("w-full sm:w-auto", "bg-main hover:bg-main/90")}
              >
                Subscribe Now - ${price}/month
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
