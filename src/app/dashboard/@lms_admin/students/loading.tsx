import { LoadingAnimation } from "@/components/loader";

export default function Loading() {
 return (
  <div className="flex justify-center items-center h-screen w-full">
   <LoadingAnimation />
  </div>
 )
}