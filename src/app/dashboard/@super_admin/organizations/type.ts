export interface Organization {
  id: string;
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
  subscriptionStartDate: Date | null;
  subscriptionIsActive: boolean;
  status: 'Active' | 'Expired' | 'Suspended';
  allowCreateCourses: boolean;
  allowCreateAICourses: boolean;
  allowCreateCoursesFromDocuments: boolean;
  logo_url?: string;
  onEdit?: (org: Organization) => void;
  onDelete?: (org: Organization) => void;
  onAddUser?: (organization: Organization) => void;
  onManageSubscription?: (org: Organization) => void;
}

export interface OrganizationFormData {
  name: string;
  domain: string;
  subscriptionPackage: string;
  allowCreateCourses: boolean;
  allowCreateAICourses: boolean;
  allowCreateCoursesFromDocuments: boolean;
  logo?: File;
  logo_url?: string;
  startDate?: string;
  endDate?: string;
}

export interface SubscriptionDetails {
  subscriptionId: number;
  tierId: number;
  tierName: string;
  startDate: string;
  expiresAt: string;
  isActive: boolean;
  maxUser: number;
  maxCourses: number;
  maxLmsManagers: number;
  createCourses: boolean;
  aiBuilder: boolean;
  documentBuilder: boolean;
}

export interface SubscriptionRequest {
  id: number;
  organizationId: number;
  requesterId: string;
  numberOfUsers: number;
  numberOfCourses: number;
  numberOfContentCreators: number;
  createdAt: string;
  status: string;
}
