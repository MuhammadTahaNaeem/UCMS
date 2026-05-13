import { useQuery } from "@tanstack/react-query";
import { fetchUserComplaints } from "@/features/user/userApi";
import { userQueryKeys } from "@/features/user/userQueryKeys";

export function useUserComplaints(params) {
  return useQuery({
    queryKey: userQueryKeys.complaints(params),
    queryFn: () => fetchUserComplaints(params),
    keepPreviousData: true,
  });
}
