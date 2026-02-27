/**
 * Instructor & Admin API — uses the central `api` instance
 * so all interceptors (auth, device fingerprint, token refresh, retry) apply.
 */
import api from './api';

export const instructorApplicationApi = {
    // Submit instructor application (public - no auth required)
    submitApplication: async (formData: any) => {
        const response = await api.post('/instructor-applications', formData);
        return response.data;
    },

    // Admin: Get all applications
    getAllApplications: async (status?: string) => {
        const params = status ? { status } : undefined;
        const response = await api.get('/instructor-applications/admin/all', { params });
        return response.data;
    },

    // Admin: Review application
    reviewApplication: async (id: string, data: { status: 'approved' | 'rejected'; rejectionReason?: string }) => {
        const response = await api.patch(`/instructor-applications/admin/${id}/review`, data);
        return response.data;
    },

    // Admin: Delete application
    deleteApplication: async (id: string) => {
        const response = await api.delete(`/instructor-applications/admin/${id}`);
        return response.data;
    },
};

export const instructorApi = {
    // Get my courses
    getMyCourses: async () => {
        const response = await api.get('/courses/instructor/my-courses');
        return response.data;
    },

    // Create course
    createCourse: async (courseData: any) => {
        const response = await api.post('/courses', courseData);
        return response.data;
    },

    // Update course
    updateCourse: async (id: string, courseData: any) => {
        const response = await api.put(`/courses/${id}`, courseData);
        return response.data;
    },

    // Delete course
    deleteCourse: async (id: string) => {
        const response = await api.delete(`/courses/${id}`);
        return response.data;
    },

    // Toggle publish course
    togglePublish: async (id: string) => {
        const response = await api.patch(`/courses/${id}/publish`, {});
        return response.data;
    },

    // Get course stats
    getCourseStats: async (id: string) => {
        const response = await api.get(`/courses/instructor/${id}/stats`);
        return response.data;
    },

    // ======== Video Management ========

    // Get course videos for management
    getCourseVideos: async (courseId: string) => {
        const response = await api.get(`/videos/manage/${courseId}`);
        return response.data;
    },

    // Add video to course
    addVideo: async (videoData: any) => {
        const response = await api.post('/videos', videoData);
        return response.data;
    },

    // Update video
    updateVideo: async (id: string, videoData: any) => {
        const response = await api.put(`/videos/${id}`, videoData);
        return response.data;
    },

    // Delete video
    deleteVideo: async (id: string) => {
        const response = await api.delete(`/videos/${id}`);
        return response.data;
    },
};

export const adminApi = {
    // Get all instructors
    getInstructors: async () => {
        const response = await api.get('/admin/instructors');
        return response.data;
    },

    // Demote instructor
    demoteInstructor: async (id: string) => {
        const response = await api.patch(`/admin/instructors/${id}/demote`, {});
        return response.data;
    },
};
