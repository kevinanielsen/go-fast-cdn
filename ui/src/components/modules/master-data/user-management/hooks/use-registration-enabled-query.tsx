import { constant } from "@/lib/constant";
import configService from "@/services/configService";
import { useQuery } from "@tanstack/react-query";

const useRegistrationEnabledQuery = () => {
  return useQuery({
    queryKey: [constant.queryKeys.registrationEnabled],
    queryFn: () => configService.getRegistrationEnabled(),
  });
};

export default useRegistrationEnabledQuery;
