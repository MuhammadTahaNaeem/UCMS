import { useMutation } from "@tanstack/react-query";
import { loginRequest } from "@/features/auth/authApi";

export function useLogin() {
  return useMutation({
    mutationFn: loginRequest,
  });
}
