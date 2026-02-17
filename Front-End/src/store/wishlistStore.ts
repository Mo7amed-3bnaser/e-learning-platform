import { create } from 'zustand';
import { wishlistAPI } from '@/lib/api';

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
  category: string;
  level: string;
  rating: number;
  enrolledStudents: number;
  instructor: {
    _id: string;
    name: string;
    avatar?: string;
  };
}

interface WishlistState {
  wishlist: Course[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchWishlist: () => Promise<void>;
  addToWishlist: (courseId: string) => Promise<void>;
  removeFromWishlist: (courseId: string) => Promise<void>;
  isInWishlist: (courseId: string) => boolean;
  clearError: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  wishlist: [],
  isLoading: false,
  error: null,

  fetchWishlist: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await wishlistAPI.getWishlist();
      set({
        wishlist: response.data.data,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'فشل في جلب قائمة الرغبات',
        isLoading: false,
      });
    }
  },

  addToWishlist: async (courseId: string) => {
    set({ isLoading: true, error: null });
    try {
      await wishlistAPI.addToWishlist(courseId);
      // إعادة جلب قائمة الرغبات بعد الإضافة
      await get().fetchWishlist();
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'فشل في إضافة الكورس',
        isLoading: false,
      });
      throw error;
    }
  },

  removeFromWishlist: async (courseId: string) => {
    set({ isLoading: true, error: null });
    try {
      await wishlistAPI.removeFromWishlist(courseId);
      // إزالة الكورس من القائمة محلياً
      set((state) => ({
        wishlist: state.wishlist.filter((course) => course._id !== courseId),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'فشل في إزالة الكورس',
        isLoading: false,
      });
      throw error;
    }
  },

  isInWishlist: (courseId: string) => {
    return get().wishlist.some((course) => course._id === courseId);
  },

  clearError: () => set({ error: null }),
}));
