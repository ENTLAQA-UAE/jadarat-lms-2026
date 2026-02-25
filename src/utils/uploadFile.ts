import { deleteImageFromStorage } from "./deleteImageFromStorage";
import { createClient } from "./supabase/client";
import { toast } from "sonner";
import JSZip from 'jszip';
import { XMLParser } from 'fast-xml-parser';

interface ScormFileResult {
    launchPath: string;
}

interface ExtractedFile {
    path: string;
    publicUrl: string;
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

async function extractAndUploadFile(
    basePath: string,
    relativePath: string,
    fileContent: Blob
): Promise<ExtractedFile | null> {
    const supabase = createClient()
    const uploadPath = `${basePath}/extract/${relativePath}`

    // Determine content type based on file extension
    const extension = relativePath.split('.').pop()?.toLowerCase()
    const contentType = getContentType(extension)

    // First attempt to upload with content type
    let { data, error } = await supabase.storage
        .from('scorm')
        .upload(uploadPath, fileContent, {
            contentType: contentType,
            upsert: true
        })

    // If file exists, try to update it
    if (error?.message === "The resource already exists") {
        const { data: updateData, error: updateError } = await supabase.storage
            .from('scorm')
            .update(uploadPath, fileContent, {
                contentType: contentType
            })
        
        data = updateData
        error = updateError
    }

    if (error || !data) {
        console.error(`❌ Failed to upload ${relativePath}:`, error)
        return null
    }

    const { data: publicUrl } = supabase.storage
        .from('scorm')
        .getPublicUrl(uploadPath)

    return {
        path: relativePath,
        publicUrl: publicUrl.publicUrl
    }
}

// Helper function to determine content type
function getContentType(extension?: string): string {
    const contentTypes: Record<string, string> = {
        // Images
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'svg': 'image/svg+xml',
        // Documents
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        // Web
        'html': 'text/html',
        'htm': 'text/html',
        'css': 'text/css',
        'js': 'application/javascript',
        'json': 'application/json',
        'xml': 'application/xml',
        // SCORM specific
        'swf': 'application/x-shockwave-flash',
        'zip': 'application/zip',
    }

    return contentTypes[extension as keyof typeof contentTypes]
}

export const uploadScormFile = async (
    name: string,
    file: File,
    organization_id: string | number,
    _toast?: any
): Promise<ScormFileResult | null> => {
    const sanitizedName = sanitizeFilename(name)
    const basePath = `${organization_id}/scorm/${sanitizedName}`

    try {
        const zip = new JSZip()
        const content = await file.arrayBuffer()
        const zipContent = await zip.loadAsync(content)

        // Get manifest content and parse launch path
        let launchPath = ''
        const manifestFile = Object.keys(zipContent.files).find(path => 
            path.toLowerCase().includes('imsmanifest.xml')
        )

        if (!manifestFile) {
            throw new Error('Invalid SCORM package: Missing imsmanifest.xml')
        }

        // Parse manifest to get launch path
        const manifestContent = await zipContent.files[manifestFile].async('text')
        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '@_'
        })
        
        const manifest = parser.parse(manifestContent)
        const resources = manifest.manifest.resources.resource
        const scoResource = Array.isArray(resources)
            ? resources.find(r => r['@_adlcp:scormtype'] === 'sco')
            : resources

        launchPath = scoResource?.['@_href'] || ''
        
        if (!launchPath) {
            throw new Error('No launch path found in manifest')
        }

        // Continue with existing file extraction logic
        const extractPromises: Promise<ExtractedFile | null>[] = []
        

        zipContent.forEach((relativePath, zipEntry) => {
            if (!zipEntry.dir) {
                extractPromises.push(
                    (async () => {
                        try {
                            const fileContent = await zipEntry.async('blob')
                            const result = await extractAndUploadFile(basePath, relativePath, fileContent)
                            return result
                        } catch (err) {
                            console.error(`Failed to process ${relativePath}:`, err)
                            return null
                        }
                    })()
                )
            }
        })

        await Promise.all(extractPromises)

        return { 
            launchPath 
        }

    } catch (error) {
        toast.error('SCORM file processing failed', {
            description: error instanceof Error ? error.message : 'Unknown error occurred',
        })
        return null
    }
}

export const switchScormFile = async (
    name: string,
    file: File,
    organization_id: string | number,
    _toast?: any
): Promise<ScormFileResult | null> => {
    const supabase = createClient()
    const sanitizedName = sanitizeFilename(name)
    const basePath = `${organization_id}/scorm/${sanitizedName}`

    try {
        // Delete the entire directory containing the old SCORM package
        const { data: files, error: listError } = await supabase.storage
            .from('scorm')
            .list(basePath)

        if (listError) throw listError

        // Delete all files in the directory
        if (files.length > 0) {
            const filesToDelete = files.map(file => `${basePath}/${file.name}`)
            const { error: deleteError } = await supabase.storage
                .from('scorm')
                .remove(filesToDelete)

            if (deleteError) throw deleteError
        }

        // Upload the new SCORM package
        const result = await uploadScormFile(name, file, organization_id, toast)
        return result

    } catch (error) {
        toast.error('Failed to switch SCORM file', {
            description: error instanceof Error ? error.message : 'Unknown error occurred',
        })
        return null
    }
}
