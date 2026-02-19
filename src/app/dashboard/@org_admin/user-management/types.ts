import { rules } from "@/utils/constants/rulesEnums"

export interface User {
    created_at?: string
    organization_id: number
    organization_domain?: string
    id?: string
    email?: string
    role: keyof typeof rules
    is_active?: boolean
    name?: string
    group_id?: number
    group_name?: string
    department?: string
    job_title?: any
    job_grade?: any
    country?: any
    city?: any
    jobtitle?: any
    jobgrade?: any
    completed_courses_count?: number
    avatar_url?: string
}