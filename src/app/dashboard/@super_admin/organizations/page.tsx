import { getOrganizations } from '@/action/super-admin/orgnizations/organizationsActions';
import OrganizationsPage from './OrganizationsPage';
import { Organization } from '@/action/super-admin/orgnizations/type'; // Ensure correct import

export default async function OrganizationsPageServer() {
  const { organizations, errorMessage } = await getOrganizations();

  // Handle error if needed
  if (errorMessage) {
    console.error('Error fetching organizations:', errorMessage);
    // Optionally, render an error component or message
  }

  return <OrganizationsPage initialData={organizations as Organization[]} />; // Ensure correct type
}
