"use client"

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Save } from 'lucide-react';
import { CourseDetailsPageProps, ScormEnum } from './types';
import { useLanguage } from '@/context/language.context';
import { CourseOutcome, LearningOutcome } from './CourseOutCome';
import { useToast } from '@/components/ui/use-toast';
import { useSearchParams } from 'next/navigation';
import { ZipUploader } from './ZipUploader';

const courseSchema = z.object({
  title: z.string().min(1, { message: "Course Title is required" }),
  description: z.string().min(1, { message: "Course Description is required" }).max(260, { message: "Course Description must be 260 characters or less" }),
  level: z.string().min(1, { message: "Course Level is required" }),
  category_id: z.coerce.number().min(1, { message: "Course Category is required" }),
  slug: z.string().min(1, { message: "Course Slug is required" })
    .regex(/^[a-zA-Z0-9-_]+$/, { message: "Slug must contain only letters, numbers, dashes, and underscores" }),
  timeline: z.coerce.number().min(1, { message: "Course Time is required" }),
  outcomes: z.array(z.object({
    id: z.string(),
    text: z.string().min(1, { message: "Outcome text is required" })
  })),
  scormFile: z.any().optional(),
  scormVersion: z.nativeEnum(ScormEnum).optional(),
  isScorm: z.boolean().optional(),
});

export type CourseFormData = z.infer<typeof courseSchema> & { 
  imagePreview: string | null, 
  image: File | null, 
  category_id: number, 
  category_name: string, 
  thumbnail: string | null, 
  scormFile?: File | null, 
  scormVersion?: ScormEnum ,
  isScorm?: boolean,
  scormUrls?: { path: string; publicUrl: string }[] | null
};

interface CourseFormProps {
  onSave: (data: CourseFormData) => void | Promise<void>;
  onChange: (data: Partial<CourseFormData>) => void;
  isLoading: boolean;
  initialData?: Partial<CourseFormData>;
  categories: CourseDetailsPageProps[];
  onScormFileUpdate?: (file: File | null) => void;
}

export function CourseForm({ onSave, onChange, isLoading, initialData = {}, categories, onScormFileUpdate }: CourseFormProps) {
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(initialData.imagePreview || null);
  const [image, setImage] = useState<File | null>(null);
  const { isRTL } = useLanguage();
  const [outcomes, setOutcomes] = useState<LearningOutcome[]>(initialData.outcomes || []);
  const [scormFile, setScormFile] = useState<File | null>(null);
  const searchParams = useSearchParams();
  const isScormFlow = searchParams.get('flow') === 'scorm';
  const [selectedScormVersion, setSelectedScormVersion] = useState<ScormEnum>();

  const { control, handleSubmit, formState: { errors } } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: initialData.title || '',
      description: initialData.description || '',
      level: initialData.level || '',
      category_id: initialData.category_id,
      slug: initialData.slug || '',
      timeline: initialData.timeline ?? 0,
      outcomes: initialData.outcomes || [],
    },
  });

  const onSubmit = (data: CourseFormData) => {
    console.log("data ===>", data);
    if (isScormFlow) {
      if (scormFile === null) {
        toast({
          title: "Error",
          description: "Please upload a SCORM package file.",
          variant: "destructive"
        });
        return;
      }
    }

    // Regular image validation
    if (initialData.thumbnail || imagePreview) {
      onSave({ 
        ...data, 
        imagePreview, 
        image, 
        outcomes, 
        scormVersion: isScormFlow ? selectedScormVersion : undefined,
        isScorm: isScormFlow,
        scormUrls: null
      });
      return;
    }

    if (!image) {
      toast({
        title: "Error",
        description: "Please upload a valid image file (JPEG, PNG, or WebP).",
        variant: "destructive"
      });
      return;
    }

    onSave({ 
      ...data, 
      imagePreview, 
      image, 
      outcomes, 
      scormVersion: isScormFlow ? selectedScormVersion : undefined,
      isScorm: isScormFlow 
    });
  };

  const handleChange = (field: keyof CourseFormData) => (value: any) => {
    onChange({ [field]: value });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        handleChange('imagePreview')(result);
        handleChange('image')(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScormUpload = (file: File | null) => {
    if (file) {
      setScormFile(file);
      onScormFileUpdate?.(file);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Course Details</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Course Title *</Label>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <Input
                  id="title"
                  placeholder="Enter course title"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    onChange({ title: e.target.value });
                  }}
                />
              )}
            />
            {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <Label htmlFor="description">Course Description * (Max 260 characters)</Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="description"
                  placeholder="Enter course description"
                  maxLength={260}
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    onChange({ description: e.target.value });
                  }}
                />
              )}
            />
            {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
          </div>

          <div>
            <Label htmlFor="level">Course Level *</Label>
            <Controller
              name="level"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    onChange({ level: value });
                  }}
                  value={field.value}
                >
                  <SelectTrigger id="level">
                    <SelectValue placeholder="Select course level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.level && <p className="text-sm text-destructive mt-1">{errors.level.message}</p>}
          </div>

          <div>
            <Label htmlFor="image">Course Image *</Label>
            <Input id="image" type="file" accept="image/*" onChange={handleImageUpload} className="w-full" />
            {imagePreview && (
              <div className="mt-2">
                <img src={imagePreview} alt="Course preview" className="max-w-full h-auto" />
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="category_id">Course Category *</Label>
            <Controller
              name="category_id"
              control={control}
              render={({ field }) => (
                <Select
                  defaultValue={initialData.category_id?.toString() || ''}
                  onValueChange={(value) => {
                    field.onChange(value);
                    onChange({ category_id: parseInt(value) });
                  }}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select course category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem className='exclude-weglot' key={category.id} value={category.id.toString()}>
                        {isRTL ? category.ar_name : category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category_id && <p className="text-sm text-destructive mt-1">{errors.category_id.message}</p>}
          </div>

          <CourseOutcome
            outcomes={outcomes}
            setOutcomes={(newOutcomes) => {
              setOutcomes(newOutcomes);
              onChange({ outcomes: newOutcomes as LearningOutcome[] });
            }}
          />

          <div>
            <Label htmlFor="slug">Course Slug *</Label>
            <Controller
              name="slug"
              control={control}
              render={({ field }) => (
                <Input
                  id="slug"
                  placeholder="Enter course slug (e.g., 'course-title')"
                  {...field}
                  onChange={(e) => {
                    const formattedSlug = e.target.value
                      .trim()
                      .toLowerCase()
                      .replace(/\s+/g, '-') // Replace spaces with dashes
                      .replace(/[^a-zA-Z0-9-_]/g, ''); // Remove invalid characters
                    field.onChange(formattedSlug);
                    onChange({ slug: formattedSlug });
                  }}
                />
              )}
            />
            <p className="text-sm text-muted-foreground mt-1">
              A valid slug should only contain lowercase letters, numbers, and hyphens (e.g., <code>course-title</code>).
            </p>
            {errors.slug && <p className="text-sm text-destructive mt-1">{errors.slug.message}</p>}
          </div>

          <div>
            <Label htmlFor="timeline">Expected Completion Time (minutes) *</Label>
            <Controller
              name="timeline"
              control={control}
              render={({ field }) => (
                <Input
                  id="timeline"
                  type="number"
                  min="1"
                  placeholder="Enter expected completion time"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    onChange({ timeline: parseInt(e.target.value) });
                  }}
                />
              )}
            />
            {errors.timeline && <p className="text-sm text-destructive mt-1">{errors.timeline.message}</p>}
          </div>

          {isScormFlow && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="scormVersion">SCORM Version *</Label>
                <Controller
                  name="scormVersion"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedScormVersion(value as ScormEnum);
                        onChange({ scormVersion: value as ScormEnum });
                      }}
                      value={field.value}
                    >
                      <SelectTrigger id="scormVersion">
                        <SelectValue placeholder="Select SCORM version" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ScormEnum.SCORM_1_2}>SCORM 1.2</SelectItem>
                        <SelectItem value={ScormEnum.SCORM_2004}>SCORM 2004</SelectItem>
                        <SelectItem value={ScormEnum.AICC} disabled className="opacity-50 cursor-not-allowed">
                          AICC (Coming Soon)
                        </SelectItem>
                        <SelectItem value={ScormEnum.XAPI} disabled className="opacity-50 cursor-not-allowed">
                          xAPI (Tin Can) (Coming Soon)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.scormVersion && (
                  <p className="text-sm text-destructive mt-1">{errors.scormVersion.message}</p>
                )}
              </div>
              {selectedScormVersion ? (
                <ZipUploader onFileUpdate={handleScormUpload} />
              ) : (
                <div className="text-sm text-amber-600 dark:text-amber-400">
                  Please select a SCORM version before uploading a file
                </div>
              )}
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Course Details
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
