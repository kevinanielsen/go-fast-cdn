import { constant } from "@/lib/constant";
import { cdnApiClient } from "@/services/authService";
import { TDashboard } from "@/types/dashboard";
import { useQuery } from "@tanstack/react-query";

const useGetDashboard = () => {
  return useQuery<TDashboard>({
    queryKey: [constant.queryKeys.dashboard],
    queryFn: async () => {
      const res = await cdnApiClient.get("/dashboard");
      return res.data;
    },
  });
};

export default useGetDashboard;
