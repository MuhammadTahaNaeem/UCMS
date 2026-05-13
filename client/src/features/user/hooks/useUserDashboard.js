import { useQuery } from "@tanstack/react-query";
import { fetchUserDashboard } from "@/features/user/userApi";
import { userQueryKeys } from "@/features/user/userQueryKeys";

export function useUserDashboard() {
  return useQuery({
    queryKey: userQueryKeys.dashboard,
    queryFn: fetchUserDashboard,
  });
}
