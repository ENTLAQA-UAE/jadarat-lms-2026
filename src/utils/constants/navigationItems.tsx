import { rules } from "./rulesEnums";

const generalRoutes = [
  {
    name: "Dashboard",
    href: "/dashboard",
  },
];

const superAdminRoutes = [
  ...generalRoutes,
  {
    name: "Organizations",
    href: "/dashboard/organizations",
  },
  {
    name: "Subscriptions",
    href: "/dashboard/subscriptions",
  },
];

const orgAdminRoutes = [
  ...generalRoutes,
  {
    name: "Organization Settings",
    href: "/dashboard/organization-settings",
  },
  
  {
    name: "User Management",
    href: "/dashboard/user-management",
  },
  {
    name: "Groups Management",
    href: "/dashboard/groups-management",
  },
];

const lmsAdminRoutes = [
  ...generalRoutes,
  //     {
  //     name: "General",
  //     href: "/dashboard/lms-dashboard"
  // },
  {
    name: "Insights",
    href: "/dashboard/insights",
  },
  {
    name: "Students",
    href: "/dashboard/students",
  },
  {
    name: "Enrollments",
    href: "/dashboard/enrollments",
  },
  {
    name: "Courses",
    href: "/dashboard/courses",
  },
  {
    name: "Categories",
    href: "/dashboard/categories",
  },
  {
    name: "Points Config",
    href: "/dashboard/points-config",
  },
  {
    name: "Gamification",
    href: "/dashboard/gamification-config",
  },
  {
    name: "Leaderboard",
    href: "/dashboard/leaderboard-config",
  },
  {
    name: "Badges",
    href: "/dashboard/badge-config",
  },
];

const learningManagerRoutes = [
  ...generalRoutes,
  {
    name: "Insights",
    href: "/dashboard/insights",
  },
  {
    name: "Students",
    href: "/dashboard/students",
  },
  {
    name: "Enrollments",
    href: "/dashboard/enrollments",
  },
  {
    name: "Courses",
    href: "/dashboard/courses",
  },
];

const learnerRoutes = [
  ...generalRoutes,
  {
    name: "Search",
    href: "/dashboard/search",
  },
  {
    name: "Learn",
    href: "/dashboard/learn",
  },
  {
    name: "Discover",
    href: "/dashboard/discover",
  },
  {
    name: "Certificates",
    href: "/dashboard/certificates",
  },
  {
    name: "Achievements",
    href: "/dashboard/achievements",
  },
  {
    name: "Leaderboard",
    href: "/dashboard/leaderboard",
  },
];

export interface MenuItem {
  name: string;
  href?: string;
}

export const sideMenuContentBasedOnRule = (rule: rules): MenuItem[] => {
  switch (rule) {
    case rules.superAdmin:
      return superAdminRoutes;

    case rules.organizationAdmin:
      return orgAdminRoutes;

    case rules.LMSAdmin:
      return lmsAdminRoutes;

    case rules.learningManager:
      return learningManagerRoutes;

    case rules.learner:
      return learnerRoutes;

    default:
      return learnerRoutes;
  }
};
