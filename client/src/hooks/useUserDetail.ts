import { useQuery, useQueries } from '@tanstack/react-query';
import axios from 'axios';
import type { User } from '@/types/user.types';

// Single user query
export function useUserDetail(userId?: number) {
  return useQuery<User>({
    queryKey: ['user', userId],
    queryFn: async () => {
      try {
        const { data } = await axios.get(`/api/users/${userId}`);
        return data;
      } catch (error) {
        console.error('Error fetching user:', error);
        throw new Error('Failed to fetch user details');
      }
    },
    enabled: !!userId,
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Multiple users query
export function useUsersDetail(userIds: number[]) {
  return useQueries({
    queries: userIds.map((id) => ({
      queryKey: ['user', id],
      queryFn: async () => {
        try {
          const { data } = await axios.get(`/api/users/${id}`);
          return data;
        } catch (error) {
          console.error('Error fetching user:', error);
          throw new Error('Failed to fetch user details');
        }
      },
      enabled: !!id,
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    }))
  });
} 