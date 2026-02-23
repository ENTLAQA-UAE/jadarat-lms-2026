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
  subscriptionExpirationDate: Date;
  status: 'Active' | 'Expired';
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
