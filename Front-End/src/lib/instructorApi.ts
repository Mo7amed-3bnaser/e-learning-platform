import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthHeader = () => {
    if (typeof window !== 'undefined') {
        const authData = localStorage.getItem('auth-storage');
        if (authData) {
            const { state } = JSON.parse(authData);
            if (state?.token) {
                return { Authorization: `Bearer ${state.token}` };
            }
        }
    }
    return {};
};

export const instructorApplicationApi = {
    // Submit instructor application (public - no auth required)
    submitApplication: async (formData: any) => {
        const response = await axios.post(
            `${API_URL}/instructor-applications`,
            formData
        );
        return response.data;
    },

    // Admin: Get all applications
    getAllApplications: async (status?: string) => {
        const url = status
            ? `${API_URL}/instructor-applications/admin/all?status=${status}`
            : `${API_URL}/instructor-applications/admin/all`;

        const response = await axios.get(url, { headers: getAuthHeader() });
        return response.data;
    },

    // Admin: Review application
    reviewApplication: async (id: string, data: { status: 'approved' | 'rejected'; rejectionReason?: string }) => {
        const response = await axios.patch(
            `${API_URL}/instructor-applications/admin/${id}/review`,
            data,
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    // Admin: Delete application
    deleteApplication: async (id: string) => {
        const response = await axios.delete(
            `${API_URL}/instructor-applications/admin/${id}`,
            { headers: getAuthHeader() }
        );
        return response.data;
    },
};

export const instructorApi = {
    // Get my courses
    getMyCourses: async () => {
        const response = await axios.get(
            `${API_URL}/courses/instructor/my-courses`,
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    // Create course
    createCourse: async (courseData: any) => {
        const response = await axios.post(
            `${API_URL}/courses`,
            courseData,
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    // Update course
    updateCourse: async (id: string, courseData: any) => {
        const response = await axios.put(
            `${API_URL}/courses/${id}`,
            courseData,
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    // Delete course
    deleteCourse: async (id: string) => {
        const response = await axios.delete(
            `${API_URL}/courses/${id}`,
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    // Toggle publish course
    togglePublish: async (id: string) => {
        const response = await axios.patch(
            `${API_URL}/courses/${id}/publish`,
            {},
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    // Get course stats
    getCourseStats: async (id: string) => {
        const response = await axios.get(
            `${API_URL}/courses/instructor/${id}/stats`,
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    // ======== Video Management ========

    // Get course videos for management
    getCourseVideos: async (courseId: string) => {
        const response = await axios.get(
            `${API_URL}/videos/manage/${courseId}`,
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    // Add video to course
    addVideo: async (videoData: any) => {
        const response = await axios.post(
            `${API_URL}/videos`,
            videoData,
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    // Update video
    updateVideo: async (id: string, videoData: any) => {
        const response = await axios.put(
            `${API_URL}/videos/${id}`,
            videoData,
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    // Delete video
    deleteVideo: async (id: string) => {
        const response = await axios.delete(
            `${API_URL}/videos/${id}`,
            { headers: getAuthHeader() }
        );
        return response.data;
    },
};

export const adminApi = {
    // Get all instructors
    getInstructors: async () => {
        const response = await axios.get(
            `${API_URL}/admin/instructors`,
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    // Demote instructor
    demoteInstructor: async (id: string) => {
        const response = await axios.patch(
            `${API_URL}/admin/instructors/${id}/demote`,
            {},
            { headers: getAuthHeader() }
        );
        return response.data;
    },
};
