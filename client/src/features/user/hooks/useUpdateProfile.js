import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { updateUserProfile } from "@/features/user/userApi";
import { userQueryKeys } from "@/features/user/userQueryKeys";
import { setCredentials } from "@/features/auth/authSlice";

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);

  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      // Update Redux store with new user data
      if (data?.data) {
        dispatch(setCredentials({ user: data.data, token, role: data.data.role }));
      }
      // Invalidate React Query cache
      queryClient.invalidateQueries({ queryKey: userQueryKeys.profile });
    },
  });
}
