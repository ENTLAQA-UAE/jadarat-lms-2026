import { getSubscriptionTiers } from '@/action/super-admin/subscriptions/SubscriptionsActions';
import SubscriptionPage from './SubscriptionPage';

export default async function SubscriptionPageServer() {
  // Fetch subscription data on the server
  const { subscriptionTiers } = await getSubscriptionTiers();

  return <SubscriptionPage initialSubscriptionTierData={subscriptionTiers} />;
}
