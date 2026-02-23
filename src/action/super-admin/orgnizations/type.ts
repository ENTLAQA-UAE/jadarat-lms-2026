export interface Organization {
  id: string;
  name: string;
  domain: string;
  subscriptionPackage: string;
  totalUsers: number;
  allowedUsers: number;
  totalCourses: number;
  allowedCourses: number;
  totalContentCreators: number;
  allowedContentCreators: number;
  subscriptionExpirationDate: Date | null;
  subscriptionStartDate: Date | null;
  subscriptionIsActive: boolean;
  status: 'Active' | 'Expired' | 'Suspended';
  allowCreateCourses: boolean;
  allowCreateAICourses: boolean;
  allowCreateCoursesFromDocuments: boolean;
}

export interface OrganizationFormData {
  name: string;
  domain: string;
  subscriptionPackage: string;
  allowCreateCourses: boolean;
  allowCreateAICourses: boolean;
  allowCreateCoursesFromDocuments: boolean;
  startDate?: string;
  endDate?: string;
}

// Add the Subscription type definition
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
