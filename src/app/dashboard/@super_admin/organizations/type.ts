export interface Organization {
  id: string; // Ensure id is always a string
  name: string;
  domain: string;
  logo?: File;
  subscriptionPackage: string;
  totalUsers: number;
  allowedUsers: number;
  totalCourses: number;
  allowedCourses: number;
  totalContentCreators: number;
  allowedContentCreators: number;
  subscriptionExpirationDate: Date | null;
  status: 'Active' | 'Expired';
  allowCreateCourses: boolean;
  allowCreateAICourses: boolean;
  allowCreateCoursesFromDocuments: boolean;
  logo_url?: string; // Add this line
  onEdit?: (org: Organization) => void;
  onDelete?: (org: Organization) => void;
  onAddUser?: (organization: Organization) => void
}

export interface OrganizationFormData {
  name: string;
  domain: string;
  subscriptionPackage: string;
  allowCreateCourses: boolean;
  allowCreateAICourses: boolean;
  allowCreateCoursesFromDocuments: boolean;
  logo?: File;
  logo_url?: string; // Add this line
}
