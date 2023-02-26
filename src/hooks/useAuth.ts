import { api } from "../utils/api";
import { useRouter } from "next/router";

const useAuth = (redirect: string | undefined) => {
  const router = useRouter();
  const {
    data: user,
    isLoading,
    error,
  } = api.user.getMe.useQuery(undefined, {
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
  if (error) {
    if (redirect) {
      router.replace(redirect).catch(() => {
        return;
      });
    }
  }
  if (!isLoading && user) {
    return { isAuthenticated: true, isLoading, user };
  }
  return { isAuthenticated: false, isLoading };
};

export default useAuth;
