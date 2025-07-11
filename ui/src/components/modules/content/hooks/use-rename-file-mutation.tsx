import { cdnApiClient } from "@/services/authService";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";

const useRenameFileMutation = (
  type: "doc" | "image",
  options?: UseMutationOptions<string, Error, FormData>
) => {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await cdnApiClient.put(`/rename/${type}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    },
    ...options,
  });
};

export default useRenameFileMutation;
