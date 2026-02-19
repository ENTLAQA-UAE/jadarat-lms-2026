"use client"; // This is a client component 👈🏽

import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

function Error({ error }: { error: Error }) {
  return (
    <div className="flex  h-screen flex-col items-center gap-4  justify-center  w-full">
      <h1 className="text-2xl font-bold text-destructive">
        Course Not Found!
      </h1>
      <Button>
        <Link href={`/`}>Back to home page</Link>
      </Button>
    </div>
  );
}

export default Error;