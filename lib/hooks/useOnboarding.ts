import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005';

export const useUserProgress = () => {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: ['userProgress'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/onboarding/progress`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return res.data;
    },
    enabled: !!user,
  });
};

export const useUpdateProgress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Record<string, boolean>) => {
      const res = await axios.patch(`${API_URL}/onboarding/progress`, data, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProgress'] });
    }
  });
};

export const useUserAchievements = () => {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: ['userAchievements'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/onboarding/achievements`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return res.data;
    },
    enabled: !!user,
  });
};

export const useTutorials = () => {
  return useQuery({
    queryKey: ['tutorials'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/onboarding/tutorials`);
      return res.data;
    }
  });
};

export const useFaqs = () => {
  return useQuery({
    queryKey: ['faqs'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/onboarding/faqs`);
      return res.data;
    }
  });
};

export const useDailyTip = () => {
  return useQuery({
    queryKey: ['dailyTip'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/onboarding/daily-tip`);
      return res.data;
    }
  });
};
