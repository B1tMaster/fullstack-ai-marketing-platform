# Settings Page and Stripe Integration

- Given the Objective, implement every detail of every task.
- document all changes made to the code.
- Only work on the objective, do not implement any other features.

## Objective

- Add support for unit testing to the project.

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

- we alread have  Stripe Customer Portal For the subscription management redirect.


## Context

/add nextjs/app/(dashboard)/settings/page.tsx
/add nextjs/app/(dashboard)/settings/loading.tsx
/add nextjs/server/queries.ts
/add nextjs/components/SubscriptionManager.tsx 
/add nextjs/lib/stripe.ts


/read-only nextjs/server/db/schema.ts
/read-only nextjs/utils/logger.ts

## High Level Tasks


1. Add stripe as a dependency to the project under nextjs directory
2. Add ability to retrieve user subscription details from the database to determine their current subscription status
2.1 For all Stripe API calls, use the stripe instance created in the stripe.ts file and use API documentation : [Stripe API Documentation](https://docs.stripe.com/api?lang=node)

3. Build the SubscriptionManager component

4. Build the Settings page functionality which includes SubscriptionManager component

 
## Low Level Tasks


    1.1 Add stripe to the project using: yarn add stripe
    1.2 For any nextjs code that requries to use stripe API import Stripe from stripe package
    1.2 Use STRIPE_SECRET_KEY already setup in the .env file to initialize the stripe package when required
    1.3 Use STRIPE_WEBHOOK_SECRET already setup in the .env file to verify the webhook event

    1.4 CREATE a new file stipe.ts under nextjs/lib directory adn use this file to create an instance of stripe that will be used in the project. Use stripe documentation to create the instance. documentation: [
        
    ](https://docs.stripe.com/api?lang=node) . make sure to use the latest version of the apiVersion in the stripe instance. look at the documentation to find the correct version.
        1.4.1 Export the stripe instance from the file so it can be used in other files in the project.

1.  2.1 CREATE getUserSubscription(): Promise<Stripe.Subscription | null> in queries.ts
    2.1.1 Use auth() to get the user id and check if the user is authenticated using the same pattern as in other queries in the queries.ts file
    2.1.2 Use the userId to retrieve the user subscription details from the database, use scema.ts Subscription type to define the shape of the subscription details. as there could bee more than one subscription per user, use findFirst() to retrieve the first subscription details.
    2.1.3 User Stripe instance created in the stripe.ts file to retrieve the subscription details for that user. read API documentation to find the correct API to use. use : stripe.subscriptions.retrieve(stripeSubscriptionId) to retrieve the subscription details for the user.

    2.1.4 Properlly log any errors in the process using our looger utily: nextjs/utils/logger.ts

    2.1.5 Add debugging statements to log the userId and the subscription details retrieved.


 3. 
  3.1 Implement the SubscriptionManager component in the SubscriptionManager.tsx file.
  3.2 Use the subscription details to populate the component.
  3.3 Use the same style for the component as in project and templates pages of the project. Ask to see any pages you need to use as reference.
  3.4 Component should have a header : Subscriton Settings 
  3.5 Component shall have a description of the plan user is using: "You are using a free plan" or "You are using a premium plan - <plan name>"
  3.5.1 CREATE a getSubscriptionStatus() : Promise<Stripe.Subscription | null> function in the SubscriptionManager.tsx file to return the subscription status details and use it to conditionally render the component.

  3.5.2 component will conditionally render the details of the compoenent based on the stripe subscription status that will be returned by: getSubscriptionStatus() active or suspended or (null means the user is on the free plan).  need to handle this case in best practice way. 
  

3.5.3 CREATE a formatDate(timestamp: number) function in the SubscriptionManager.tsx file to format the date to be used in the component. function should calculate the number of days left in the current period and format the date to be used in the component based on date returned from stripe from next billing date.. 

3.6 - FREE plan:

3.6.1 for a user on a free plan, the user will see the list of features they will get access to after subscribing to the premium plan. those are : 
  - Unlimited projects - star icon
  - Unlimited templates - LayoutTemplate icon
  - Unlimited storage. - Box icon
  lucid react icons will represent the features: Star, LayoutTemplate, Box. icons will be displayed to the left of the feature name. 
  3.6.2 Component shall have a "Subscribe Now - $price " button to manage adding subscription. price should be formatted using toFixed(2) and currency should be USD and retrived from stripe. this button is only visible if the user is on the free plan. Use the same style as in project and templates pages of the project for the button.
 
 3.6.3 clicking on "Subscribe Now" button should open a modal to manage the subscription on stripe. we will not be implementing this inside our applicaiton, we need to redirect the user to stripe to manage the subscription.. 

3.7 PAID Plan:

 3.8 For a user on the paid plan should see details of the plan: "You are using a premium plan - <plan name>"
  - Plan Status - from stripe
  - Next billing date - from stripe
  - formated number of days left in the current period - from stripe use formatDate() function to format the date.

  3.7.1 Component shall have a "Manage Subscription" button to manage the subscription. this button is only visible if the user is on the premium plan. Use the same style as in project and templates pages of the project but use shades of green color for the button.
  

  3.9. clicking on "manage subscription" button should redirect the user to stripe to manage the subscription..  we will not be implementing this inside our applicaiton, we need to redirect the user to stripe to manage the subscription.


   4. 
 4.1 Use existing nextjs/app/(dashboard)/settings/page.tsx file to build the settings page as a base.
 4.2 create const subscription and use getUserSubscription() to retrieve the subscription details.
 4.3 add  component <SubscriptionManager subscription={subscription}/> that will be used to manage the subscription. use SubscriptionManager.tsx file to create the component.
 
4.4 <SubscriptionManager /> compoenent is rendered in the settings page.tsx file.

4.5 Use the same style as in project and templates pages of the project for the settings pages.

5. implement other functionality related to subscription management and stripe. If anything is missing from the objectives or requirments make sure to ask before implementing anything. 

6. Present a plan for implementation only as a first step. do not make changes until you get approval to move forward.  Evalaute options and ask any quesitons you need. Ask acess to any files not included in the context. 
