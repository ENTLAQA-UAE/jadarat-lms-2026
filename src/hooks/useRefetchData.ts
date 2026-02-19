import { useCallback } from "react";
import { useRouter } from "next/navigation";

export function useRefetchData() {
  const router = useRouter()

  const refetchData = useCallback(() => {
  router.refresh()
 }, [router])

 return refetchData
}