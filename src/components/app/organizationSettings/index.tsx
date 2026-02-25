"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/hooks/redux.hook";

// Dynamic imports for components with no SSR
const Registeration = dynamic(() => import("./registeration"), { ssr: false });
const Courses = dynamic(() => import("./courses"), { ssr: false });
const Subscription = dynamic(() => import("./subscription"), { ssr: false });
const Branding = dynamic(() => import("./branding"), { ssr: false });
const Certificates = dynamic(() => import("./certificates"), { ssr: false });
const UsedSkelton = dynamic(() => import("./skeletons/used-skelton"), { ssr: false });
const SubscriptionSkelton = dynamic(() => import("./skeletons/SubscriptionSkelton"), { ssr: false });

export default function Settings() {
  const { loading: loadingTheme } = useAppSelector((state) => state.organization);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="w-full h-full p-4 sm:p-6">
      <div className="grid gap-4 md:grid-cols-2 grid-cols-1 ">
        <div x-chunk="dashboard-01-chunk-2" className="w-full h-fit col-span-2">
          {isClient && !loadingTheme ? (
            <Subscription />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SubscriptionSkelton />
              <UsedSkelton />
            </div>
          )}
        </div>
        <div x-chunk="dashboard-01-chunk-0" className="w-full h-fit md:col-span-1 col-span-2">
          <Registeration />
        </div>
        <div x-chunk="dashboard-01-chunk-1" className="w-full h-fit md:col-span-1 col-span-2">
          <Courses />
        </div>
        <div x-chunk="dashboard-01-chunk-2" className="w-full md:h-full h-fit lg:col-span-1 col-span-2">
          <Branding />
        </div>
        <div x-chunk="dashboard-01-chunk-2" className="w-full xl:h-full h-fit lg:col-span-1 col-span-2">
          <Certificates />
        </div>
      </div>
    </div>
  );
}
