export interface Subscription {
  id: string;
  package: string;
  totalAllowedUsers: number;
  totalAllowedCourses: number;
  totalAllowedContentCreators: number;
  associatedOrganizations: number;
  allowCreateCourses: boolean;
  allowCreateAICourses: boolean;
  allowCreateCoursesFromDocuments: boolean;
}

// Define the columns for the DataTableComponent
export const columns = [
  {
    id: 'package',
    label: 'Package',
    accessor: 'package',
  },
  {
    id: 'totalAllowedUsers',
    label: 'Total Allowed Users',
    accessor: 'totalAllowedUsers',
  },
  {
    id: 'totalAllowedCourses',
    label: 'Total Allowed Courses',
    accessor: 'totalAllowedCourses',
  },
  {
    id: 'totalAllowedContentCreators',
    label: 'Total Allowed Content Creators',
    accessor: 'totalAllowedContentCreators',
  },
  {
    id: 'associatedOrganizations',
    label: 'Associated Organizations',
    accessor: 'associatedOrganizations',
  },
  {
    id: 'actions',
    label: 'Actions',
    accessor: 'actions',
  },
];
