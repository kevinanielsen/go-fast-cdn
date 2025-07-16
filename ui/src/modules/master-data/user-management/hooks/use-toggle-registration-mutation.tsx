import { constant } from "@/lib/constant";
import configService from "@/services/configService";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const UseToggleRegistrationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isRegistrationEnabled: boolean) => {
      return configService.setRegistrationEnabled(isRegistrationEnabled);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [constant.queryKeys.registrationEnabled],
      });
    },
  });
};

export default UseToggleRegistrationMutation;
