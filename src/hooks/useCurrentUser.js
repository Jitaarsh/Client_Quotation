import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMe } from '../api/authApi';
import useAuthStore from '../store/authStore';

const useCurrentUser = () => {
  const token = useAuthStore((state) => state.token);

  const query = useQuery({
    queryKey: ['currentUser'],
    queryFn: getMe,
    enabled: Boolean(token),
  });

  useEffect(() => {
    if (query.data?.data) {
      useAuthStore.getState().setUser(query.data.data);
    }
  }, [query.data]);

  return query;
};

export default useCurrentUser;
