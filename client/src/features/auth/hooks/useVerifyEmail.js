import { useMutation } from "@tanstack/react-query";
import { verifyEmailRequest } from "@/features/auth/authApi";

export function useVerifyEmail() {
  return useMutation({
    mutationFn: verifyEmailRequest,
  });
}
