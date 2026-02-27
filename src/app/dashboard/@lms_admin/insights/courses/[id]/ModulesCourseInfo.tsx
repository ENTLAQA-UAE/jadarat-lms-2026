"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createClient } from "@/utils/supabase/client";

interface ModuleData {
  module_id: string;
  module_title: string;
  module_order: number;
  lesson_count: number;
  block_count: number;
}

/**
 * Modules Course Info -- displays course modules from local database.
 *
 * Previously fetched from Coassemble API with hardcoded clientIdentifier=49.
 * Now reads from the local course_content table via the
 * get_course_modules_from_content RPC function.
 *
 * For legacy courses without native content, shows a placeholder message.
 */
export default function ModulesCourseInfo({ id }: { id: string }) {
  const [modules, setModules] = useState<ModuleData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.rpc('get_course_modules_from_content', {
          p_course_id: parseInt(id),
        });

        if (error) {
          console.error("Error fetching modules:", error);
        } else if (data) {
          setModules(data as ModuleData[]);
        }
      } catch (error) {
        console.error("Error fetching course modules:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchModules();
    }
  }, [id]);

  return (
    <Card className="border-none">
      <CardHeader>
        <CardTitle>Course Modules</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid px-8">
          <ScrollArea className="h-[25rem]">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2 mb-4">
                  <Skeleton className="w-[30%] h-[16px]" />
                  <Skeleton className="w-[80%] h-[12px]" />
                </div>
              ))
            ) : modules.length > 0 ? (
              <div className="grid gap-4">
                {modules.map((module) => (
                  <div key={module.module_id} className="space-y-1">
                    <div className="font-medium exclude-weglot">
                      {module.module_order + 1}. {module.module_title}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {module.lesson_count} lessons &middot; {module.block_count} blocks
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                No module data available. This course may be a legacy Coassemble course
                or has not been built with the native editor yet.
              </p>
            )}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
