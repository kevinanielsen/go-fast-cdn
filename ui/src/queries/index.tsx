import { FileMetadata } from "@/types/fileMetadata";
import { TContentCardProps } from "@/types/contentCard";
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import toast from "react-hot-toast";

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
      const res = await fetch("/api/cdn/size");
      if (!res.ok) throw new Error("Network response was not ok");
      const data = await res.json();
      return data.cdn_size_bytes;
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
      const res = await fetch(
        `/api/cdn/${type === "documents" ? "doc" : "image"}/${filename}`
      );
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
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
      const res = await fetch(
        `/api/cdn/${type === "images" ? "image" : "doc"}/all`
      );
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    },
  });
}

export function useResizeModal(
  filename: string
): UseQueryResult<FileMetadata, Error> {
  return useQuery({
    queryKey: queryKeys.image(filename),
    queryFn: async (): Promise<FileMetadata> => {
      const res = await fetch(`/api/cdn/image/${filename}`);
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    },
  });
}

export function useUploadFile(type: "doc" | "image") {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append(type, file);
      const res = await fetch(`/api/cdn/upload/${type}`, {
        method: "POST",
        body: form,
      });
      if (res.statusText === "Conflict") {
        const error = await res.text();
        console.error("Upload error:", error);
        throw new Error("File already uploaded.");
      }
      if (!res.ok) {
        const error = await res.text();
        console.error("Upload error:", error);
        throw new Error("Network response was not ok");
      }

      return res.json();
    },
    onSuccess: () => {
      toast.dismiss();
      toast.success("Successfully uploaded file!");
      queryClient.invalidateQueries({ queryKey: queryKeys.size() });
    },
    onError: (err: Error) => {
      toast.dismiss();
      toast.error(err.message);
    },
  });
}

export function useRenameFile(
  type: "doc" | "image",
  options?: UseMutationOptions<string, Error, FormData>
) {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch(`/api/cdn/rename/${type}`, {
        method: "PUT",
        body: formData,
      });
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
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
      const res = await fetch(`/api/cdn/resize/image`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    },
    ...options,
  });
}

export function useDeleteFile(type: "doc" | "image") {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (filename: string) => {
      console.log("ttt", type);
      const res = await fetch(`/api/cdn/delete/${type}/${filename}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Network response was not ok");
      console.log("res", res);
      return res.json();
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
    onError: (err: Error) => {
      toast.dismiss();
      toast.error(err.message);
      console.error(err.message);
    },
  });
}
