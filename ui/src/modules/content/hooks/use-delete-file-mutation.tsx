import { constant } from "@/lib/constant";
import { cdnApiClient } from "@/services/authService";
import { IErrorResponse } from "@/types/response";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import toast from "react-hot-toast";

const useDeleteFileMutation = (type: "doc" | "image") => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (filename: string) => {
      const res = await cdnApiClient.delete(`/delete/${type}/${filename}`);
      return res.data;
    },
    onSuccess: () => {
      toast.dismiss();
      toast.success("Successfully deleted file!");
      queryClient.invalidateQueries({
        queryKey: constant.queryKeys.size(),
      });
      queryClient.invalidateQueries({
        queryKey: constant.queryKeys.images(
          type === "image" ? "images" : "documents"
        ),
      });
    },
    onError: (error) => {
      const err = error as AxiosError<IErrorResponse>;
      toast.dismiss();
      const message =
        err.response?.data?.error || err.message || "Delete failed";
      toast.error(message);
    },
  });
};

export default useDeleteFileMutation;
