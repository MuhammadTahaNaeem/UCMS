import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createComplaint } from "@/features/user/userApi";
import { userQueryKeys } from "@/features/user/userQueryKeys";

export function useCreateComplaint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createComplaint,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: ["user-complaints"] });
    },
  });
}
