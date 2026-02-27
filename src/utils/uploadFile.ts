import { createClient } from "./supabase/client";
import { toast } from "sonner";

interface ScormFileResult {
    launchPath: string;
}

export const uploadImage = async (name: string, file: File, organization_id: string | number) => {
    const supabase = createClient();
    const { data, error } = await supabase.storage.from(`LMS Resources/${organization_id}`).upload(name, file, {
        cacheControl: '3600',
        upsert: false
    })

    if (error == null) {
        const { data: url, error: err } = await supabase.storage.from(`LMS Resources`).createSignedUrl(`${organization_id}/${data.path}`, 630720000)
        if (err == null)
            return url;
        else
            toast.error(`Getting Uploaded file URL failed`, {
                description: err.message,
            })
    } else {
        if (error.message === "The resource already exists") {
            const { data, error } = await supabase.storage.from(`LMS Resources/${organization_id}`).update(name, file, {
                cacheControl: '3600',
                upsert: false
            })
            if (error == null) {
                const { data: url, error: err } = await supabase.storage.from(`LMS Resources`).createSignedUrl(`${organization_id}/${data.path}`, 630720000)
                if (err == null)
                    return url;
                else
                    toast.error(`Getting Uploaded file URL failed`, {
                        description: err.message,
                    })
            }
        } else
            toast.error(`Upload ${name} failed`, {
                description: error.message,
            })
    }
}

function sanitizeFilename(filename: string): string {
    return filename.replace(/[^\x00-\x7F]/g, "").replace(/\s+/g, "_")
}

export const uploadCertificatesImages = async (name: string, file: File, _toast: any, path: string) => {
    const supabase = createClient()
    const sanitizedName = sanitizeFilename(name)

    const { data, error } = await supabase.storage.from(path).upload(sanitizedName, file, {
        cacheControl: '3600',
        upsert: false
    })

    if (error == null) {
        const { data: url, error: err } = await supabase.storage.from(path).createSignedUrl(`/${data.path}`, 630720000)
        if (err == null)
            return url
        else
            toast.error(`Getting Uploaded file URL failed`, {
                description: err.message,
            })
    } else {
        toast.error(`Upload ${sanitizedName} failed`, {
            description: error.message,
        })
    }
}

/**
 * Upload a SCORM ZIP package to Bunny CDN via server API route.
 * The server handles ZIP extraction, manifest parsing, and Bunny Storage upload.
 */
export const uploadScormFile = async (
    name: string,
    file: File,
    organization_id: string | number,
    _toast?: any
): Promise<ScormFileResult | null> => {
    const sanitizedName = sanitizeFilename(name)

    try {
        toast.info('Uploading', { description: 'Uploading SCORM package to CDN...' })

        const formData = new FormData()
        formData.append('file', file)
        formData.append('slug', sanitizedName)
        formData.append('organization_id', String(organization_id))

        const res = await fetch('/api/scorm/upload', {
            method: 'POST',
            body: formData,
        })

        if (!res.ok) {
            const data = await res.json()
            throw new Error(data.error || 'Upload failed')
        }

        const data = await res.json()

        toast.success('Success', {
            description: `Uploaded ${data.totalFiles} files (${(data.totalBytes / 1024 / 1024).toFixed(1)} MB)`,
        })

        return {
            launchPath: data.launchPath,
        }
    } catch (error) {
        toast.error('SCORM file processing failed', {
            description: error instanceof Error ? error.message : 'Unknown error occurred',
        })
        return null
    }
}

/**
 * Replace an existing SCORM package on Bunny CDN.
 * Deletes the old package first, then uploads the new one.
 */
export const switchScormFile = async (
    name: string,
    file: File,
    organization_id: string | number,
    _toast?: any
): Promise<ScormFileResult | null> => {
    const sanitizedName = sanitizeFilename(name)

    try {
        toast.info('Replacing', { description: 'Replacing SCORM package...' })

        const formData = new FormData()
        formData.append('file', file)
        formData.append('slug', sanitizedName)
        formData.append('organization_id', String(organization_id))
        formData.append('delete_old', 'true')

        const res = await fetch('/api/scorm/upload', {
            method: 'POST',
            body: formData,
        })

        if (!res.ok) {
            const data = await res.json()
            throw new Error(data.error || 'Upload failed')
        }

        const data = await res.json()

        toast.success('Success', {
            description: `Replaced with ${data.totalFiles} files (${(data.totalBytes / 1024 / 1024).toFixed(1)} MB)`,
        })

        return {
            launchPath: data.launchPath,
        }
    } catch (error) {
        toast.error('Failed to switch SCORM file', {
            description: error instanceof Error ? error.message : 'Unknown error occurred',
        })
        return null
    }
}
