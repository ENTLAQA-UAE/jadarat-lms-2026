import SubscriptionPage from './SubscriptionPage';
import { getSubscriptionTiers } from '@/action/super-admin/subscriptions/SubscriptionsActions';

export default async function SubscriptionPageServer() {
  const { subscriptionTiers } = await getSubscriptionTiers();
  return <SubscriptionPage initialSubscriptionTierData={subscriptionTiers} />;
}
