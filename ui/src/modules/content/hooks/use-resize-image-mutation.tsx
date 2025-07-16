import { cdnApiClient } from "@/services/authService";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";

type ResizeImageParams = {
  filename: string;
  width: number;
  height: number;
};
const useResizeImageMutation = (
  options?: UseMutationOptions<string, Error, ResizeImageParams>
) => {
  return useMutation({
    mutationFn: async (data: ResizeImageParams) => {
      const res = await cdnApiClient.put(`/resize/image`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return res.data;
    },
    ...options,
  });
};

export default useResizeImageMutation;
