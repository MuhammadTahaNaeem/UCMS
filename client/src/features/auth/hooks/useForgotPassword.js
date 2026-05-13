import { useMutation } from "@tanstack/react-query";
import { forgotPasswordRequest } from "@/features/auth/authApi";

export function useForgotPassword() {
  return useMutation({
    mutationFn: forgotPasswordRequest,
  });
}
