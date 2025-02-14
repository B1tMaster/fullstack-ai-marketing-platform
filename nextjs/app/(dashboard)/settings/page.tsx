import { getUserSubscription } from "@/server/queries";
import SubscriptionManager from "@/components/SubscriptionManager";

export default async function SettingsPage() {
  const subscription = await getUserSubscription();
  
  return (
    <div className="container mx-auto p-6">
      <SubscriptionManager subscription={subscription} />
    </div>
  );
}
