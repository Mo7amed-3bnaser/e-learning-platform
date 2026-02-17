/**
 * Unit Tests - Auth Store (Zustand)
 * اختبارات وحدة لمخزن المصادقة
 */
import '@testing-library/jest-dom';
import { useAuthStore } from '@/store/authStore';

// Helper to reset store between tests
const resetStore = () => {
  useAuthStore.setState({
    user: null,
    token: null,
    isAuthenticated: false,
    _hasHydrated: false,
  });
};

describe('Auth Store', () => {
  beforeEach(() => {
    resetStore();
    // Clear localStorage mock
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  });

  it('should have correct initial state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should login correctly', () => {
    const user = {
      id: '123',
      name: 'محمد أحمد',
      email: 'mohamed@test.com',
      phone: '01012345678',
      role: 'student' as const,
    };
    const token = 'test-token-123';

    useAuthStore.getState().login(token, user);

    const state = useAuthStore.getState();
    expect(state.user).toEqual(user);
    expect(state.token).toBe(token);
    expect(state.isAuthenticated).toBe(true);
  });

  it('should logout correctly', () => {
    // First login
    const user = {
      id: '123',
      name: 'محمد أحمد',
      email: 'mohamed@test.com',
      phone: '01012345678',
      role: 'student' as const,
    };
    useAuthStore.getState().login('test-token', user);

    // Then logout
    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should update user correctly', () => {
    const user = {
      id: '123',
      name: 'محمد أحمد',
      email: 'mohamed@test.com',
      phone: '01012345678',
      role: 'student' as const,
    };
    useAuthStore.getState().login('test-token', user);

    const updatedUser = {
      ...user,
      name: 'محمد علي',
      avatar: 'https://example.com/avatar.jpg',
    };
    useAuthStore.getState().updateUser(updatedUser);

    const state = useAuthStore.getState();
    expect(state.user?.name).toBe('محمد علي');
    expect(state.user?.avatar).toBe('https://example.com/avatar.jpg');
  });

  it('should set hydration state', () => {
    useAuthStore.getState().setHasHydrated(true);
    expect(useAuthStore.getState()._hasHydrated).toBe(true);
  });

  it('should maintain authentication after user update', () => {
    const user = {
      id: '123',
      name: 'Test User',
      email: 'test@test.com',
      phone: '01023456789',
      role: 'admin' as const,
    };
    useAuthStore.getState().login('admin-token', user);
    useAuthStore.getState().updateUser({ ...user, name: 'Updated Admin' });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.token).toBe('admin-token');
    expect(state.user?.name).toBe('Updated Admin');
  });
});
