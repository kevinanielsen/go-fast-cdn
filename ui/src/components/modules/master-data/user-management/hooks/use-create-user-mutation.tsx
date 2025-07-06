import { constant } from "@/lib/constant";
import { adminUserService } from "@/services/adminUserService";
import { IUserCreateRequest } from "@/types/user";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useCreateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: IUserCreateRequest) => {
      return adminUserService.createUser(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [constant.queryKeys.users],
      });
    },
  });
};

export default useCreateUserMutation;
