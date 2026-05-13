import { useMutation } from "@tanstack/react-query";
import { resetPasswordRequest } from "@/features/auth/authApi";

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ token, payload }) => resetPasswordRequest(token, payload),
  });
}
