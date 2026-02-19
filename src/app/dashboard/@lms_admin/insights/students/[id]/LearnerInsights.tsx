"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase";
import React, { useEffect, useState } from "react";
import LearnerInsightsSkeleton from "./LearnerInsightsSkeleton";

// Define the type for the fetched data
interface LearnerInsightsProps {
  learnerInsights: {
    allCourses: number;
    completedCourses: number;
    activeCourses: number;
  } | null;
}

function LearnerInsights({ learnerInsights }: LearnerInsightsProps) {
  if (!learnerInsights) return <LearnerInsightsSkeleton />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Learner Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span>All Courses:</span>
          <span className="font-bold">{learnerInsights?.allCourses}</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Completed Courses:</span>
          <span className="font-bold">{learnerInsights?.completedCourses}</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Active Courses:</span>
          <span className="font-bold">{learnerInsights?.activeCourses}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default LearnerInsights;