'use client'
import { useEffect, useState, useRef } from 'react'
import { ScormAPI } from '@/lib/scorm-api'
import { ScormHeader } from './scorm-header'
import { CourseSidebar } from '@/components/course/CourseSidebar'
import { useRouter } from 'next/navigation'
import MobileCourseDrawer from '@/app/dashboard/@learner/course/play/[id]/MobileSide'
import { updateCourseProgress } from '@/action/students/studentsActions'
import lzwcompress from 'lzwcompress'
import { PlayerProps, ScormDataType } from './types'
import { revalidate } from '@/action/revalidate'

export default function Player({
  courseData,
  slug,
  showSidebar = true,
  isGenerating = false,
  isSharing = false,
  baseUrl,
  launch_path
}: PlayerProps) {
  const router = useRouter();
  const [progressValue, setProgressValue] = useState<number>(courseData?.progress ? +courseData?.progress : 0)
  const scormAPI = useRef<ScormAPI>()
  const [scormData, setScormData] = useState<ScormDataType>({
    lessonStatus: 'incomplete',
    score: {
      raw: '0',
      min: '0',
      max: '100'
    },
    sessionTime: '00:00:00',
    suspendData: '',
    progressMeasure: '0',
    lessonLocation: '',
  })
  let parsedData = null
  try {
    if (scormData.suspendData) {
      const suspendJson = JSON.parse(scormData.suspendData)
      if (suspendJson?.d) {
        const decompressedData = lzwcompress.unpack(suspendJson.d)
        parsedData = JSON.parse(decompressedData)
      }
    }
  } catch (error) {
    console.warn('Failed to parse suspend data:', error)
  }
  useEffect(() => {
    if (parsedData?.progress?.p > progressValue) {
      setProgressValue(Math.round(parsedData.progress.p))
    }
  }, [parsedData, progressValue])


  useEffect(() => {
    const api = new ScormAPI()
    if (courseData?.progress) {
      api.LMSSetValue('cmi.core.progress_measure', courseData?.progress)
      setScormData(prev => ({ ...prev, progressMeasure: courseData?.progress }))
    }
    if (courseData?.scorm_data?.suspendData) {
      api.LMSSetValue('cmi.suspend_data', courseData?.scorm_data?.suspendData ?? '')
      setScormData(prev => ({ ...prev, suspendData: courseData?.scorm_data?.suspendData ?? '' }))
      if (courseData?.scorm_data?.lessonLocation) {
        api.LMSSetValue('cmi.core.lesson_location', courseData?.scorm_data?.lessonLocation)
      }
    }
    api.LMSSetValue = (element: string, value: string) => {
      switch (element) {
        case 'cmi.core.lesson_status':
          setScormData(prev => ({ ...prev, lessonStatus: value }))
          break
        case 'cmi.core.score.raw':
          setScormData(prev => ({ ...prev, score: { ...prev.score, raw: value } }))
          break
        case 'cmi.core.session_time':
          setScormData(prev => ({ ...prev, sessionTime: value }))
          break
        case 'cmi.suspend_data':
          setScormData(prev => ({ ...prev, suspendData: value }))
          break
        case 'cmi.core.progress_measure':
          setScormData(prev => ({ ...prev, progressMeasure: value }))
          break
        case 'cmi.core.lesson_location':
          setScormData(prev => ({ ...prev, lessonLocation: value }))
          break
      }
      return 'true'
    }
    scormAPI.current = api
      ; (window as any).API = api
  }, [courseData])

  // update progress with supabase
  useEffect(() => {
    const updateProgress = async () => {
      const lessonStatusLower = scormData.lessonStatus?.toLowerCase()
      const shouldUpdate = courseData?.course_id && (
        lessonStatusLower === 'passed' ||
        lessonStatusLower === 'completed' ||
        progressValue > 0 ||
        scormData.suspendData ||
        scormData.lessonLocation
      )
      if (shouldUpdate) {
        const progressValues = ['passed', 'completed'].includes(lessonStatusLower ?? '')
          ? 100
          : progressValue
        

        const { success, error } = await updateCourseProgress(
          courseData?.course_id,
          progressValues,
          scormData
        )
        if (error) {
          console.error('Error updating course progress:', error)
        }
        if (success) {
          // progress updated
        }
      }
    }
    if (showSidebar) {
      updateProgress()
    }
    }, [courseData?.course_id, courseData?.progress, progressValue, scormData, showSidebar])
  

  return (
    <div className="p-4 min-h-screen bg-background">
      <ScormHeader title={courseData?.course_name} />
      <div className={`flex h-[calc(100vh-120px)] gap-2`}>
        {showSidebar && (
          <>
            <div className="hidden md:block w-[300px] h-[calc(100vh-120px)] overflow-y-auto">
                <CourseSidebar
                onBack={async () => {
                  await revalidate(`/dashboard/course/${slug}`)
                  router.push(`/dashboard/course/${slug}`)
                }}
                progress={progressValue}
                  courseId={courseData?.course_id ? courseData?.course_id : 0}
                  learnerId={courseData?.user_id ?? ''}
                  courseName={courseData?.course_name ?? ''}
                  learnerName={courseData?.user_name ?? ''}
                  isGenerating={isGenerating}
                  isSharing={isSharing}
                />
            </div>

            <div className="fixed bottom-4 left-4 md:hidden z-50">
              <MobileCourseDrawer
                back={async () => {
                  await revalidate(`/dashboard/course/${slug}`)
                  router.push(`/dashboard/course/${slug}`)
                }}
                percentage={progressValue}
                overallProgress={progressValue}
                generatingCertificate={isGenerating}
                sharingCertificate={isSharing}
                selectedCourse={{
                  id: courseData?.course_id ? courseData?.course_id : 0,
                  name: courseData?.course_name,
                }}
                id={courseData?.user_id}
                name={courseData?.user_name}
              />
            </div>
          </>
        )}

        <div className="flex-1 bg-card rounded-lg overflow-hidden border h-full">
          <iframe
            src={`${baseUrl}/api/scorm/content/${slug}/${courseData?.launch_path ?? launch_path}`}
            className="w-full h-full bg-background"
            title="SCORM Content"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-downloads"
            allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
          />
        </div>
      </div>
    </div>
  )
}