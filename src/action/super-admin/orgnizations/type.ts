export interface Organization {
  id: string;
  name: string;
  domain: string;
  subscriptionPackage: 'Basic' | 'Pro' | 'Enterprise'; // Update type
  totalUsers: number;
  allowedUsers: number;
  totalCourses: number;
  allowedCourses: number;
  totalContentCreators: number;
  allowedContentCreators: number;
  subscriptionExpirationDate: Date;
  status: 'Active' | 'Expired'; // Update type
  allowCreateCourses: boolean;
  allowCreateAICourses: boolean;
  allowCreateCoursesFromDocuments: boolean;
}

export interface OrganizationFormData {
  name: string;
  domain: string;
  subscriptionPackage: 'Basic' | 'Pro' | 'Enterprise'; // Update type
  allowCreateCourses: boolean;
  allowCreateAICourses: boolean;
  allowCreateCoursesFromDocuments: boolean;
}

// Add the Subscription type definition
export interface Subscription {
  id: string; // Ensure id is a string
  package: string;
  totalAllowedUsers: number;
  totalAllowedCourses: number;
  totalAllowedContentCreators: number;
  associatedOrganizations: number;
}
