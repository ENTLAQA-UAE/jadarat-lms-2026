'use client'

import React, { useState, useEffect } from 'react'
import { CourseForm } from '../../add-course/CourseForm'
import { CoursePreview } from '../../add-course/CoursePreview'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Eye } from 'lucide-react'
import { toast } from "sonner"
import { updateCourse } from '@/action/lms-admin/insights/courses/course/courseAction'
import { switchScormFile, uploadImage } from '@/utils/uploadFile'
import { deleteImageFromStorage } from '@/utils/deleteImageFromStorage'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ZipUploader } from "../../add-course/ZipUploader"
import { createClient } from '@/utils/supabase/client'
import Player from '@/app/dashboard/@learner/course/scorm-player/[slug]/Player'
import { CourseUserDetails } from '@/app/dashboard/@learner/course/scorm-player/[slug]/types'

interface CourseData {
  imagePreview: string
  course_id: number,
  organization_id: number,
  title: string,
  description: string,
  category_id: number,
  category_name: string,
  level: string,
  timeline: number,
  slug: string,
  thumbnail: string,
  content_id?: string,
  outcomes: { id: string; text: string }[],
  is_scorm: boolean,
  scorm_version: string
}

export default function EditCourseDetails({ categories, courseData, courseId, baseUrl, launch_path, features }: {
  categories: {
    id: number
    name: string
    ar_name: string
  }[]
  courseData: CourseData[]
  courseId: number
  baseUrl: string
  launch_path: string | null
  features: {
    create_courses: boolean
  }
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [courseDetails, setCourseDetails] = useState<CourseData | null>(null)
  const [isScormModalOpen, setIsScormModalOpen] = useState(false)
  const [scormFile, setScormFile] = useState<File | null>(null)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)

  useEffect(() => {
    setCourseDetails(courseData[0])
  }, [courseData])

  const handleChange = (data: any) => {
    setCourseDetails(prevDetails => {
      if (prevDetails) {
        return { ...prevDetails, ...data, timeline: prevDetails.timeline, category_id: data.category_id ?? prevDetails.category_id, category_name: data.category_name ?? prevDetails.category_name, outcomes: data.outcomes ?? prevDetails.outcomes};
      }
      return prevDetails;
    });
  };

  useEffect(() => {
    const category_name = categories.find((category) => category.id === courseDetails?.category_id)?.name || null;
    setCourseDetails(prevData => {
      if (prevData) {
        return { ...prevData, category_name: category_name! };
      }
      return prevData;
    });
  }, [courseDetails?.category_id, categories]);

  const handleSave = async (data: any) => {

    setIsLoading(true);
    let imageUrl = courseDetails?.thumbnail;
    // upload image to supabase storage
    if (data.image) {
      const image = await uploadImage(`course_${courseId}`, data.image as any, courseDetails?.organization_id ?? 0);
      if (image) {
        imageUrl = image.signedUrl;
      }
    }

    // Get categoryId
    try {
      const payload = {
        _course_id: courseId,
        _organization_id: courseDetails?.organization_id ?? null,
        _title: data.title,
        _description: data.description,
        _category_id: courseDetails?.category_id,
        _level: data.level,
        _completion_time: data.timeline,
        _slug: data.slug,
        _image_preview: imageUrl,
        _outcomes: data.outcomes,
      };


      const { data: response, errorMessage } = await updateCourse(payload);

      if (errorMessage) {
        // if errorMessage delete the image from supabase storage
        if (imageUrl) {
          await deleteImageFromStorage(`${courseDetails?.organization_id}/course_${courseId}`);
        }
        toast.error("Error", {
          description: errorMessage,
        });
      } else {
        toast.success("Success", {
          description: "Course details updated successfully!",
        });
      }
    } catch (err) {
      console.error("Error saving course:", err);
    } finally {
      setIsLoading(false); // Ensure loading state is set back to false
    }
  };

  const handleScormFileUpdate = async () => {
    if (!scormFile) return

    setIsLoading(true)
    try {
      // Upload SCORM file to storage
      const result = await switchScormFile(
        `${courseDetails?.slug}`,
        scormFile,
        courseDetails?.organization_id ?? 0,
        toast
      )
      if (result) {
        const supabase = createClient()   
        const { data, error } = await supabase.from('courses').update({
          launch_path: result.launchPath
        }).eq('id', courseId)
        if (error) {
          toast.error("Error", {
            description: error.message,
          });
        }
      }
    } catch (err) {
      console.error("Error updating SCORM file:", err)
      toast.error("Error", {
        description: "Failed to update SCORM file",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!courseDetails) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-6">Edit Course: {courseDetails.title}</h1>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Area: Course Details Form */}
        <div className="w-full lg:w-2/3">
          <CourseForm
            onSave={handleSave}
            onChange={handleChange}
            isLoading={isLoading}
            initialData={courseDetails}
            categories={categories}
          />
        </div>

        {/* Right Area: Course Preview and Content Management */}
        <div className="w-full lg:w-1/3">
          <div className="space-y-6">
            {/* Course Preview Card */}
            <CoursePreview
              title={courseDetails.title}
              category={courseDetails.category_name}
              level={courseDetails.level}
              completionTime={courseDetails.timeline}
              imagePreview={courseDetails.imagePreview ?? courseDetails.thumbnail}

            />

            {/* Content Management Buttons */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Course Content</h2>
                <div className="flex flex-col space-y-4">
                  {courseDetails.is_scorm ? (
                    <Button
                      variant="default"
                      className="w-full"
                      onClick={() => setIsScormModalOpen(true)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Update SCORM Package
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      className="w-full"
                      asChild
                    >
                      {features.create_courses ? <Link href={`/dashboard/courses/add-course/build-course?courseId=${courseDetails.course_id}`}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Content
                    </Link> : <p>Edit Content</p>}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => courseDetails.is_scorm ? setIsPreviewModalOpen(true) : null}
                    asChild={!courseDetails.is_scorm}
                  >
                    {courseDetails.is_scorm ? (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Preview Content
                      </>
                    ) : (
                      features.create_courses ? <Link href={`/dashboard/courses/preview-content?courseId=${courseDetails.course_id}`}>
                        <Eye className="w-4 h-4 mr-2" />
                        Preview Content
                      </Link> : <p>Preview Content</p>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add the SCORM Update Modal */}
      <Dialog open={isScormModalOpen} onOpenChange={setIsScormModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update SCORM Package</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <ZipUploader onFileUpdate={setScormFile} />
            <div className="mt-4 flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsScormModalOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleScormFileUpdate}
                disabled={!scormFile || isLoading}
              >
                {isLoading ? "Uploading..." : "Update"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add the SCORM Preview Modal */}
      <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
        <DialogContent className="max-w-[95vw] h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>SCORM Content Preview</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-hidden aspect-video">
            {isPreviewModalOpen && (
              <Player 
                slug={courseDetails.slug}
                baseUrl={baseUrl}
                showSidebar={false}
                launch_path={launch_path ?? ""}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}