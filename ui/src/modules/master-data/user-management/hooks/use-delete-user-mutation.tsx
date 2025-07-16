import { constant } from "@/lib/constant";
import { adminUserService } from "@/services/adminUserService";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => {
      return adminUserService.deleteUser(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [constant.queryKeys.users],
      });
    },
  });
};

export default useDeleteUserMutation;
