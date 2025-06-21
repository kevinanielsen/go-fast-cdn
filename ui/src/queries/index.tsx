import { FileMetadata } from "../types/fileMetadata";
import { TContentCardProps } from "../types/contentCard";
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import toast from "react-hot-toast";
import { cdnApiClient } from "../services/authService";

export const queryKeys = {
  all: [{ entity: "cdn" }] as const,
  size: () => [{ ...queryKeys.all[0], scope: "size" }] as const,
  image: (filename: string) =>
    [{ ...queryKeys.all[0], scope: "file-data", filename }] as const,
  dimensions: (height: number, width: number) =>
    [{ ...queryKeys.all[0], scope: "aaaa", height, width }] as const,
  images: (type: "documents" | "images") =>
    [{ ...queryKeys.all[0], scope: "files", type }] as const,
};

export function useGetSize() {
  return useQuery({
    queryKey: queryKeys.size(),
    queryFn: async () => {
      const res = await cdnApiClient.get("/size");
      return res.data.cdn_size_bytes;
    },
  });
}

type FileDataParams = {
  filename: string;
  type: "documents" | "images";
};

export function useGetFileData({
  filename,
  type,
}: FileDataParams): UseQueryResult<FileMetadata, Error> {
  return useQuery({
    queryKey: queryKeys.image(filename),
    queryFn: async (): Promise<FileMetadata> => {
      const res = await cdnApiClient.get(
        `/${type === "documents" ? "doc" : "image"}/${filename}`
      );
      return res.data;
    },
  });
}

type GetFilesParams = {
  type: "documents" | "images";
};

export function useGetFiles({
  type,
}: GetFilesParams): UseQueryResult<TContentCardProps[], Error> {
  return useQuery({
    queryKey: queryKeys.images(type),
    queryFn: async () => {
      const res = await cdnApiClient.get(
        `/${type === "images" ? "image" : "doc"}/all`
      );
      return res.data;
    },
  });
}

export function useResizeModal(
  filename: string
): UseQueryResult<FileMetadata, Error> {
  return useQuery({
    queryKey: queryKeys.image(filename),
    queryFn: async (): Promise<FileMetadata> => {
      const res = await cdnApiClient.get(`/image/${filename}`);
      return res.data;
    },
  });
}

export function useUploadFile(type: "doc" | "image") {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append(type, file);
      const res = await cdnApiClient.post(`/upload/${type}`, form, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.dismiss();
      toast.success("Successfully uploaded file!");
      queryClient.invalidateQueries({ queryKey: queryKeys.size() });
    },
    onError: (err: any) => {
      toast.dismiss();
      const message = err.response?.data?.error || err.message || "Upload failed";
      toast.error(message);
    },
  });
}

export function useRenameFile(
  type: "doc" | "image",
  options?: UseMutationOptions<string, Error, FormData>
) {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await cdnApiClient.put(`/rename/${type}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data;
    },
    ...options,
  });
}

type ResizeImageParams = {
  filename: string;
  width: number;
  height: number;
};

export function useResizeImage(
  options?: UseMutationOptions<string, Error, ResizeImageParams>
) {
  return useMutation({
    mutationFn: async (data: ResizeImageParams) => {
      const res = await cdnApiClient.put(`/resize/image`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return res.data;
    },
    ...options,
  });
}

export function useDeleteFile(type: "doc" | "image") {
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
        queryKey: queryKeys.size(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.images(type === "image" ? "images" : "documents"),
      });
    },
    onError: (err: any) => {
      toast.dismiss();
      const message = err.response?.data?.error || err.message || "Delete failed";
      toast.error(message);
    },
  });
}
