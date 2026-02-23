import OrganizationsPage from './OrganizationsPage';
import { getOrganizations } from '@/action/super-admin/orgnizations/organizationsActions';

export default async function OrganizationsPageServer() {
  const { organizations } = await getOrganizations();
  return <OrganizationsPage initialData={organizations} />;
}
