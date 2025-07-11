import { constant } from "@/lib/constant";
import { cdnApiClient } from "@/services/authService";
import { FileMetadata } from "@/types/fileMetadata";
import { useQuery } from "@tanstack/react-query";

const useResizeModalQuery = (filename: string) => {
  return useQuery({
    queryKey: constant.queryKeys.image(filename),
    queryFn: async (): Promise<FileMetadata> => {
      const res = await cdnApiClient.get(`/image/${filename}`);
      return res.data;
    },
  });
};

export default useResizeModalQuery;
