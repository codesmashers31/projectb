import { useQuery } from '@tanstack/react-query';
import axios from '../lib/axios';
import { useAuth } from '../context/AuthContext';

export interface UserProfile {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
    personalInfo?: any;
    // Add other fields as expected from /api/user/profile
}

export const useUserProfile = () => {
    const { user } = useAuth();
    const userId = user?.id || user?._id || user?.userId;

    return useQuery({
        queryKey: ['userProfile', userId],
        queryFn: async () => {
            if (!userId) return null;
            const response = await axios.get('/api/user/profile', {
                headers: { userid: userId }
            });
            return response.data;
        },
        enabled: !!userId,
        staleTime: 1000 * 60 * 5, // 5 minutes
        // Use context user as placeholder data if available, to prevent flickers
        placeholderData: user ? { success: true, data: user } : undefined
    });
};
