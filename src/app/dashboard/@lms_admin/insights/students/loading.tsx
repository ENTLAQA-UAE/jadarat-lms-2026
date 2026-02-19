import { LoadingAnimation } from "@/components/loader";

export default function Loading() {
 return (
  <div className="flex justify-center items-center h-[calc(100dvh-64px)] w-full">
   <LoadingAnimation />
  </div>
 )
}