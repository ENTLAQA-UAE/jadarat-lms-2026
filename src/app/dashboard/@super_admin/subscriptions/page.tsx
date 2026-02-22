import SubscriptionPage from './SubscriptionPage';
import { Subscription } from './columns';

// TODO: Replace mock data with real data from getSubscriptionTiers()
// import { getSubscriptionTiers } from '@/action/super-admin/subscriptions/SubscriptionsActions';

const mockSubscriptionTiers: Subscription[] = [
  {
    id: '1',
    package: 'Basic',
    totalAllowedUsers: 25,
    totalAllowedCourses: 10,
    totalAllowedContentCreators: 3,
    associatedOrganizations: 4,
  },
  {
    id: '2',
    package: 'Pro',
    totalAllowedUsers: 100,
    totalAllowedCourses: 50,
    totalAllowedContentCreators: 5,
    associatedOrganizations: 8,
  },
  {
    id: '3',
    package: 'Enterprise',
    totalAllowedUsers: 500,
    totalAllowedCourses: 100,
    totalAllowedContentCreators: 15,
    associatedOrganizations: 12,
  },
];

export default async function SubscriptionPageServer() {
  return <SubscriptionPage initialSubscriptionTierData={mockSubscriptionTiers} />;
}
