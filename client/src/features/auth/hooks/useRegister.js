import { useMutation } from "@tanstack/react-query";
import { registerRequest } from "@/features/auth/authApi";

export function useRegister() {
  return useMutation({
    mutationFn: registerRequest,
  });
}
