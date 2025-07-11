import { constant } from "@/lib/constant";
import { adminUserService } from "@/services/adminUserService";
import { IUserEditRequest } from "@/types/user";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useEditUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { id: number; data: IUserEditRequest }) => {
      return adminUserService.updateUser(payload.id, payload.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [constant.queryKeys.users],
      });
    },
  });
};

export default useEditUserMutation;
