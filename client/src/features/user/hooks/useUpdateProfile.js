import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserProfile } from "@/features/user/userApi";
import { userQueryKeys } from "@/features/user/userQueryKeys";

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.profile });
    },
  });
}
