import { constant } from "@/lib/constant";
import { cdnApiClient } from "@/services/authService";
import { useQuery } from "@tanstack/react-query";

const useGetSizeQuery = () => {
  return useQuery({
    queryKey: constant.queryKeys.size(),
    queryFn: async () => {
      const res = await cdnApiClient.get("/size");
      return res.data.cdn_size_bytes;
    },
  });
};

export default useGetSizeQuery;
