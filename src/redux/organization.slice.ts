import { FullCourseTypes } from "@/app/home/types";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

type OrganizationThemeType = {
    logo: string,
    authBackground: string,
    name: string,
    primaryColor: string,
    secondaryColor: string,
    organization_id: number | string,
    registerationEnabled: boolean,
    registerationRequireApproval: boolean,
    registerationRequireSpecificDomain: boolean,
    registerationDomain: string,
    courseExpirationEnabled: boolean,
    courseExpirationPeriod: number,
    courseSelfEntrollmentPolicy: 'direct' | 'lms',
    certificate?: {
        certificateTemplate?: number
        certificateLogo?: string
        certificateAuthTitle?: string
        certificateSign?: string
        certificateBGColor?: string
        certificatePreview?: string
    },
    lang?: string
}

interface Subscription {
    id: number
    created_at: string
    expires_at: string
    organization_id: number
    subscription_tier: number
    start_date: string
    tier_name: string
    max_user: number
    max_courses: number
    max_lms_managers: number
}


export interface organizationStateType {
    settings: OrganizationThemeType
    subscription?: Subscription
    loading: boolean
    courses: FullCourseTypes[]
}
export const initialState: organizationStateType = {
    settings: {
        logo: "/logo.png",
        authBackground: "/side.png",
        name: "Entlaqa",
        primaryColor: "#706efa",
        secondaryColor: "",
        courseExpirationEnabled: false,
        courseExpirationPeriod: 0,
        courseSelfEntrollmentPolicy: 'direct',
        organization_id: 0,
        registerationDomain: '',
        registerationEnabled: false,
        registerationRequireApproval: false,
        registerationRequireSpecificDomain: false,
        certificate: {}
    },
    subscription: undefined,
    loading: true,
    courses: []
};

export const organizationSlice = createSlice({
    name: "organization",
    initialState,
    reducers: {
        setOrganizationSettings(state, action: PayloadAction<OrganizationThemeType>) {
            state.settings = action.payload
            state.loading = false
        },
        setOrganizationSubscription(state, action: PayloadAction<Subscription>) {
            state.subscription = action.payload
        },
        setOrganizationCourses(state, action: PayloadAction<FullCourseTypes[]>) {
            state.courses = action.payload
        },
        updateLoading(state) {
            state.loading = false
        }
    },
});

export const { setOrganizationSettings, setOrganizationSubscription, updateLoading, setOrganizationCourses } = organizationSlice.actions;

export default organizationSlice.reducer;