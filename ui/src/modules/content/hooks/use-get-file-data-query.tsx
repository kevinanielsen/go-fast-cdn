import { constant } from "@/lib/constant";
import { cdnApiClient } from "@/services/authService";
import { FileMetadata } from "@/types/fileMetadata";
import { useQuery } from "@tanstack/react-query";

type FileDataParams = {
  filename: string;
  type: "documents" | "images";
};

const useGetFileDataQuery = ({ filename, type }: FileDataParams) => {
  return useQuery({
    queryKey: constant.queryKeys.image(filename),
    queryFn: async (): Promise<FileMetadata> => {
      const res = await cdnApiClient.get(
        `/${type === "documents" ? "doc" : "image"}/${filename}`
      );
      return res.data;
    },
  });
};

export default useGetFileDataQuery;
