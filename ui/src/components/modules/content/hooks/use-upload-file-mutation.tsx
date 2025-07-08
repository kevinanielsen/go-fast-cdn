import { constant } from "@/lib/constant";
import { cdnApiClient } from "@/services/authService";
import { IErrorResponse } from "@/types/response";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import toast from "react-hot-toast";

const useUploadFileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { file: File; type: "doc" | "image" }) => {
      const form = new FormData();
      form.append(payload.type, payload.file);
      const res = await cdnApiClient.post(`/upload/${payload.type}`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Successfully uploaded file!");
      queryClient.invalidateQueries({ queryKey: constant.queryKeys.all });
    },
    onError: (error) => {
      const err = error as AxiosError<IErrorResponse>;
      const message = err.response?.data?.error || "Upload failed";
      toast.error(message);
    },
  });
};

export default useUploadFileMutation;
