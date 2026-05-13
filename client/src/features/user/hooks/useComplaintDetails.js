import { useQuery } from "@tanstack/react-query";
import { fetchComplaintDetails } from "@/features/user/userApi";
import { userQueryKeys } from "@/features/user/userQueryKeys";

export function useComplaintDetails(id) {
  return useQuery({
    queryKey: userQueryKeys.complaintDetails(id),
    queryFn: () => fetchComplaintDetails(id),
    enabled: Boolean(id),
  });
}
