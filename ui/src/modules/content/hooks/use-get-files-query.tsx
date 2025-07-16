import { constant } from "@/lib/constant";
import { cdnApiClient } from "@/services/authService";
import { TFile } from "@/types/file";
import { useQuery } from "@tanstack/react-query";

type GetFilesParams = {
  type: "documents" | "images";
};
const useGetFilesQuery = ({ type }: GetFilesParams) => {
  return useQuery({
    queryKey: constant.queryKeys.images(type),
    queryFn: async () => {
      const res = await cdnApiClient.get<TFile[]>(
        `/${type === "images" ? "image" : "doc"}/all`
      );
      return res.data;
    },
  });
};

export default useGetFilesQuery;
