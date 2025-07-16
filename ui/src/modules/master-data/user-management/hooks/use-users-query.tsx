import { constant } from "@/lib/constant";
import { adminUserService } from "@/services/adminUserService";
import { useQuery } from "@tanstack/react-query";

const useUsersQuery = () => {
  return useQuery({
    queryKey: [constant.queryKeys.users],
    queryFn: () => adminUserService.listUsers(),
  });
};

export default useUsersQuery;
