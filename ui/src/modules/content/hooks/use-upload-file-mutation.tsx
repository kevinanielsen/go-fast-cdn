import { constant } from "@/lib/constant";
import { cdnApiClient } from "@/services/authService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  });
};

export default useUploadFileMutation;
