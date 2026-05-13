import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateComplaint } from "@/features/user/userApi";
import { userQueryKeys } from "@/features/user/userQueryKeys";

export function useUpdateComplaint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => updateComplaint(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: ["user-complaints"] });
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: userQueryKeys.complaintDetails(variables.id) });
      }
    },
  });
}
