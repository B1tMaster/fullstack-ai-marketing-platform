# Settings Page and Stripe Integration

- Given the Objective, implement every detail of every task.
- document all changes made to the code.
- Only work on the objective, do not implement any other features.

## Objective


- Build Setting page to allow User to see and manage their subscription and payment details.
- Build the Settings page component allowing user to subsribe for a premium plan with credit card using stripe.

- Build the Settings page component allowing user to manage their payment method with stripe.

- Build the Settings page component allowing user to cancel their subscription with stripe.

- Build the Settings page component allowing user to see their subscription details.

- A user can have eiher default Free Plan or a Premium Plan. for a premium plan user will need to subscribe to the plan using stripe. Unlimited plan will have access to all features.  Free paln will have limited access.

- we will use already defined in schema.ts : stripeCustomersTable and subscriptionsTable to manage the subscription details with stripe. 

- we will need to  we need to implement the Stripe webhook endpoint o handle subscription status changes  . use STRIPE_WEBHOOK_SECRET from .env file to implement the webhook endpoint. 

- we will need to fetch the price details from stripe as we already defined the product in stripe. 
use STRIPE_PRICE_ID from .env file to fetch the price details. 

- we DO not have a Stripe Customer Portal For the subscription management redirect.
  so we will neeed ti implement creation of a portal session to manage the subscription.
  use stripe documentation to implement the portal session. documentation: [Stripe API Documentation](https://docs.stripe.com/api?lang=node)
 
 
  

## Context

/add nextjs/app/(dashboard)/settings/page.tsx
/add nextjs/app/(dashboard)/settings/loading.tsx
/add nextjs/server/queries.ts
/add nextjs/components/SubscriptionManager.tsx 
/add nextjs/lib/stripe.ts


/read-only nextjs/server/db/schema.ts
/read-only nextjs/utils/logger.ts

## High Level Tasks

2.1 For all Stripe API calls, use  use API documentation : [Stripe API Documentation](https://docs.stripe.com/api?lang=node)


 
## Low Level Tasks

we need to fix current code to allow user to subscribe to a premium plan.. 

 we will re-write : /api/stripe/create-portal-session/route.ts to handle the creation of the portal session. 

  we will use baseUrl from .env file to create the portal session:  APP_URL
  
  sample snippet of code that works, needs to be incorporated into the route.ts file:

 const baseUrl = process.env.APP_URL;
    if (!baseUrl) {
      throw new Error("APP_URL environment variable is not set");
    }

    const customer = await db.query.stripeCustomersTable.findFirst({
      where: eq(stripeCustomersTable.userId, userId),
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }
const session = await stripe.billingPortal.sessions.create({
      customer: customer.stripeCustomerId,
      return_url: `${baseUrl}/settings`,
    });

return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating portal session", error);
    return NextResponse.json(
      { error: "Error creating portal session" },
      { status: 500 }
    );
  }
