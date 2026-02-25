'use client'
import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { coursesTitlesAndIds } from '@/action/lms-admin/insights/courses/coursesAction'
import { enrollLearnersToCourses, getStudentsData } from '@/action/students/studentsActions'
import { useToast } from '@/components/ui/use-toast'


function ActionEnrollmentTable() {
    const { toast } = useToast()
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [learners, setLearners] = useState<{ id: string; name: string }[]>([]);
    const [courses, setCourses] = useState<{ course_id: number; title: string }[]>([]);
    const [selectedLearners, setSelectedLearners] = useState<{ id: string; name: string }[]>([]);
    const [learnerSearch, setLearnerSearch] = useState('');
    const [selectedCourses, setSelectedCourses] = useState<{ course_id: number; title: string }[]>([]);
    const [courseSearch, setCourseSearch] = useState('');

    const [learnersLoading, setLearnersLoading] = useState(false);
    const [learnersError, setLearnersError] = useState<string | null>(null);
    const [coursesLoading, setCoursesLoading] = useState(false);
    const [coursesError, setCoursesError] = useState<string | null>(null);

    // Fetch learners and courses from the API when modal opens
    useEffect(() => {
        if (isModalOpen) {
            fetchLearners();
            fetchCourses();
        }
    }, [isModalOpen]);

    const fetchLearners = async () => {
        setLearnersLoading(true);
        setLearnersError(null);
        try {
            const { data, errorMessage } = await getStudentsData();
            if (errorMessage) {
                setLearnersError(errorMessage);
            } else {
                setLearners(data);
            }
        } catch (error) {
            setLearnersError('Failed to fetch learners');
        } finally {
            setLearnersLoading(false);
        }
    };

    const fetchCourses = async () => {
        setCoursesLoading(true);
        setCoursesError(null);
        try {
            const { data: courses, errorMessage } = await coursesTitlesAndIds();
            if (errorMessage) {
                setCoursesError(errorMessage);
            } else {
                setCourses(courses);
            }
        } catch (error) {
            setCoursesError('Failed to fetch courses');
        } finally {
            setCoursesLoading(false);
        }
    };

    const filteredLearners = learners.filter(learner =>
        learner.name?.toLowerCase().includes(learnerSearch.toLowerCase())
    );

    const filteredCourses = courses.filter(course =>
        course.title?.toLowerCase().includes(courseSearch.toLowerCase())
    );

    const handleSelectLearner = (learner: { id: string; name: string }) => {
        if (!selectedLearners.some(selected => selected.id === learner.id)) {
            setSelectedLearners(prev => [...prev, learner]);
        }
    };

    const handleRemoveLearner = (id: string) => {
        setSelectedLearners(prev => prev.filter(learner => learner.id !== id));
    };

    const handleSelectCourse = (course: { course_id: number; title: string }) => {
        if (!selectedCourses.some(selected => selected.course_id === course.course_id)) {
            setSelectedCourses(prev => [...prev, course]);
        }
    };

    const handleRemoveCourse = (id: number) => {
        setSelectedCourses(prev => prev.filter(course => course.course_id !== id));
    };

    const handleEnroll = async () => {
        const learnersIds = selectedLearners.map(learner => learner.id); // Extract UUIDs
        const coursesIds = selectedCourses.map(course => course.course_id); // Extract BIGINTs
        const { errorMessage, loading } = await enrollLearnersToCourses(learnersIds, coursesIds);
        if (loading) {
            setLoading(true);
            toast({
                title: 'Enrolling learners...',
                description: 'Please wait while we enroll learners to courses',
            });
        }
        if (errorMessage) {
            console.error('Enrollment failed:', errorMessage);
            toast({
                title: 'Enrollment failed',
                description: errorMessage,
                variant: 'destructive',
            });
            setLoading(false);
        } else {
            toast({
                title: 'Enrollment successful',
                description: 'Learners enrolled successfully',
            });
            setLoading(false);
        }
        setIsModalOpen(false);
        setSelectedLearners([]);
        setSelectedCourses([]);
    };

    return (
        <>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                    <Button variant="default">Enroll To Course</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Enroll Learners to Courses</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="learners">Learners</Label>
                            <Input
                                id="learners"
                                placeholder="Search learners..."
                                value={learnerSearch}
                                onChange={(e) => setLearnerSearch(e.target.value)}
                            />
                            {learnersLoading && <p>Loading learners...</p>}
                            {learnersError && <p role="alert" className="text-sm text-destructive">{learnersError}</p>}
                            <div className="flex flex-wrap gap-2 mt-2">
                                {selectedLearners.map(learner => (
                                    <Badge key={learner.id} variant="secondary">
                                        {learner.name}
                                        <button onClick={() => handleRemoveLearner(learner.id)} className="ml-1">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                            <ScrollArea className='max-h-32'>
                                <ul className="mt-2">
                                    {filteredLearners.map(learner => (
                                        <li
                                            key={learner.id}
                                            className="cursor-pointer hover:bg-accent p-1 rounded-md transition-colors"
                                            onClick={() => handleSelectLearner(learner)}
                                        >
                                            {learner.name}
                                        </li>
                                    ))}
                                </ul>
                            </ScrollArea>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="courses">Courses</Label>
                            <Input
                                id="courses"
                                placeholder="Search courses..."
                                value={courseSearch}
                                onChange={(e) => setCourseSearch(e.target.value)}
                            />
                            {coursesLoading && <p>Loading courses...</p>}
                            {coursesError && <p role="alert" className="text-sm text-destructive">{coursesError}</p>}
                            <div className="flex flex-wrap gap-2 mt-2">
                                {selectedCourses.map(course => (
                                    <Badge key={course.course_id} variant="secondary">
                                        {course.title}
                                        <button onClick={() => handleRemoveCourse(course.course_id)} className="ml-1">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                            <ScrollArea className='max-h-32'>
                                <ul className="mt-2">
                                    {filteredCourses.map(course => (
                                        <li
                                            key={course.course_id}
                                            className="cursor-pointer hover:bg-accent p-1 rounded-md transition-colors"
                                            onClick={() => handleSelectCourse(course)}
                                        >
                                            {course.title}
                                        </li>
                                    ))}
                                </ul>
                            </ScrollArea>
                        </div>
                    </div>
                    <Button disabled={loading || learnersLoading || coursesLoading || selectedLearners.length === 0 || selectedCourses.length === 0} onClick={handleEnroll}>{loading ? 'Enrolling...' : 'Enroll'}</Button>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default ActionEnrollmentTable;
