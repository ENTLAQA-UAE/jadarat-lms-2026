export interface CertificatesCardPageType {
   id: number
   created_at: string
   user_id: string
   course_id: number
   certificate: string
   updated_at: any
   uuid?: string
   status?: 'active' | 'expired' | 'revoked'
   expires_at?: string | null
   title: string
   description: string
   level: string
   category: string
}

