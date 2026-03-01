'use client'

import {  useEffect, useState } from 'react'
import { CourseForm } from './CourseForm'
import { CoursePreview } from './CoursePreview'
import { toast } from "sonner"
import { CourseDetailsPageProps, ScormEnum } from './types'
import { uploadImage } from '@/utils/uploadFile'
import { useAppSelector } from '@/hooks/redux.hook'
import { addCourse } from '@/action/lms-admin/insights/courses/course/courseAction'
import { useRouter, useSearchParams } from 'next/navigation'
import { deleteImageFromStorage } from '@/utils/deleteImageFromStorage'
import { LearningOutcome } from './CourseOutCome'
import { uploadScormFile } from '@/utils/uploadFile'


export default function CourseDetails({ categories, features }: { categories: CourseDetailsPageProps[], features: { ai_builder: boolean; document_builder: boolean } }) {
   const router = useRouter();
   const searchParams = useSearchParams();
   const flow = searchParams.get('flow');
   const { user: { organization_id } } = useAppSelector(state => state.user);
   const [isLoading, setIsLoading] = useState(false)
   const [courseDetails, setCourseDetails] = useState({
      title: '',
      description: '',
      category_id: 0,
      category_name: '',
      level: '',
      timeline: 0,
      slug: '',
      imagePreview: null as string | null,
      image: null as File | null,
      outcomes: [] as LearningOutcome[],
      scormVersion: ScormEnum ,
      isScorm: false,
      launchPath: "",
   })
   const [isClient, setIsClient] = useState<boolean>(false)
   const [scormFile, setScormFile] = useState<File | null>(null);

   useEffect(() => {
      setIsClient(true)
   }, [])

   useEffect(() => {
      const category_name = categories.find((category) => category.id === courseDetails?.category_id)?.name || null;
      setCourseDetails(prevData => ({ ...prevData, category_name: category_name! }));
   }, [courseDetails?.category_id, categories]);

   const handleChange = (data: Partial<typeof courseDetails>) => {
      setCourseDetails(prevDetails => ({ ...prevDetails, ...data }))
   }

   const handleScormFileUpdate = (file: File | null) => {
      setScormFile(file);
   };

   const handleSave = async (data: typeof courseDetails) => {
      setCourseDetails(data);
      setIsLoading(true);

      let imageUrl = data.imagePreview;
      let uploadedImageKey: string | null = null;

      try {
         const dataToSend = {
            ...data,
            launchPath: "",
         };

         if (data.imagePreview || data.image) {
            try {
               const uploadedImage = await uploadImage(`course_${data.slug}`, data.image as any, organization_id);
               if (uploadedImage) {
                  imageUrl = uploadedImage.signedUrl;
                  dataToSend.imagePreview = imageUrl;
                  uploadedImageKey = `${organization_id}/course_${data.slug}`;
               }
            } catch (error) {
               console.error("Image upload failed:", error);
               setIsLoading(false);
               toast.error("Error", {
                  description: "Failed to upload image. Please try again.",
               });
               return;
            }
         }

         if (flow === 'scorm' && scormFile) {
            try {
               const uploadedScorm = await uploadScormFile(
                  `${data.slug}`,
                  scormFile,
                  organization_id,
                  toast,
               );
               if (uploadedScorm) {
                  dataToSend.launchPath = uploadedScorm.launchPath;
               }
            } catch (error) {
               console.error("SCORM upload failed:", error);
               setIsLoading(false);
               toast.error("Error", {
                  description: "Failed to upload SCORM package. Please try again.",
               });
               return;
            }
         }

         const coursePayload = {
            _category_id: dataToSend.category_id,
            _completion_time: dataToSend.timeline,
            _description: dataToSend.description,
            _image_preview: dataToSend.imagePreview,
            _level: dataToSend.level,
            _organization_id: organization_id,
            _slug: dataToSend.slug,
            _title: dataToSend.title,
            _outcomes: dataToSend.outcomes,
            _scorm_version: data.isScorm ? data.scormVersion : null,
            _is_scorm: data.isScorm,
            _launch_path: dataToSend.launchPath,
         };

         const { data: courseData, errorMessage } = await addCourse(coursePayload);

         if (errorMessage) {
            if (uploadedImageKey) {
               await deleteImageFromStorage(uploadedImageKey);
            }
            setIsLoading(false);
            toast.error("Error", {
               description: errorMessage,
            });
         } else {
            setIsLoading(false);

            if (flow === 'scorm') {
               toast.success("Success", {
                  description: "SCORM course uploaded successfully!",
               });
               router.push('/dashboard/courses');
            } else if (flow === 'ai' || flow === 'document') {
               router.push(`/dashboard/courses/add-course/build-course?courseId=${courseData}&mode=ai`);
               toast.success("Success", {
                  description: "Course created! Starting AI generation...",
               });
            } else {
               router.push(`/dashboard/courses/add-course/build-course?courseId=${courseData}`);
               toast.success("Success", {
                  description: "Course details saved successfully!",
               });
            }
         }
      } catch (error) {
         console.error("An error occurred while saving the course:", error);
         setIsLoading(false);
         toast.error("Error", {
            description: "An unexpected error occurred. Please try again.",
         });

         if (uploadedImageKey) {
            await deleteImageFromStorage(uploadedImageKey);
         }
      }
   };



   if (!features?.ai_builder && flow === "ai") {
      return isClient && <div>Can&apos;t build course with AI Builder</div>
   }
   if (!features?.document_builder && flow === "document") {
      return isClient && <div>Can&apos;t build course with Document Builder</div>
   }

   return (
      isClient && <div className="p-4">
         <h1 className="text-2xl font-semibold mb-6">Course Management</h1>
         <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-2/3">
               <CourseForm
                  onSave={handleSave as any}
                  onChange={handleChange as any}
                  isLoading={isLoading}
                  initialData={courseDetails as any}
                  categories={categories}
                  onScormFileUpdate={handleScormFileUpdate}
               />
            </div>
            <div className="w-full lg:w-1/3">
               <div className="space-y-6">
                  <CoursePreview
                     title={courseDetails.title}
                     category={courseDetails.category_name}
                     level={courseDetails.level}
                     completionTime={courseDetails.timeline}
                     imagePreview={courseDetails.imagePreview}
                  />
               </div>
            </div>
         </div>
      </div>
   )
}
