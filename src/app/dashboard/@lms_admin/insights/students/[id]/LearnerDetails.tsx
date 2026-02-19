"use client";
import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase";
import LearnerDetailsSkeleton from "./LearnerDetailsSkeleton";

interface LearnerDetailsProps {
  learner: LearnerData | null;
}

interface LearnerData {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
  department: string;
  group: string;
  lastLogin: string;
  avatarUrl?: string;
}

const LearnerDetails: React.FC<LearnerDetailsProps> = ({ learner }) => {
  if (!learner) {
    return <LearnerDetailsSkeleton />;
  }

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Learner Details</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col rtl:gap-4  md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
        <Avatar className="h-24 w-24">
          <AvatarImage
            src={learner.avatarUrl || "/placeholder.svg"}
            alt={learner.name}
          />
          <AvatarFallback>
            {learner.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold exclude-weglot">{learner.name}</h2>
          <p className="text-muted-foreground exclude-weglot">
            {learner.email}
          </p>
          <p>
            Job Title:{" "}
            <span className="exclude-weglot">{learner.jobTitle}</span>
          </p>
          <p>
            Department:{" "}
            <span className="exclude-weglot">{learner.department}</span>
          </p>
          <p>
            Group: <span className="exclude-weglot">{learner.group}</span>
          </p>
          <p>
            Last Login:{" "}
            <span className="exclude-weglot">{learner.lastLogin}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LearnerDetails;