import User from '../models/User.js';
import { ERROR_MESSAGES } from './constants.js';

/**
 * Find enrollment entry for a user in a given course.
 * Supports both old format (plain ObjectId) and new format ({ course, videoProgress, ... }).
 *
 * @param {Object}  user     – Mongoose User document (must have `enrolledCourses` populated)
 * @param {string}  courseId – The course ID to look for
 * @returns {{ enrollment: object|null, index: number }}
 *   enrollment is the matching entry (or null), index is its position (-1 if not found)
 */
export const findEnrollment = (user, courseId) => {
    const index = user.enrolledCourses.findIndex((e) => {
        if (e.course) return e.course.toString() === courseId.toString();
        return e.toString() === courseId.toString();
    });

    return {
        enrollment: index !== -1 ? user.enrolledCourses[index] : null,
        index,
    };
};

/**
 * Check whether a user is enrolled in a specific course.
 *
 * @param {Object}  user     – Mongoose User document
 * @param {string}  courseId – The course ID to check
 * @returns {boolean}
 */
export const isUserEnrolled = (user, courseId) => {
    return user.enrolledCourses.some((e) => {
        if (e.course) return e.course.toString() === courseId.toString();
        return e.toString() === courseId.toString();
    });
};

/**
 * Ensure a user is enrolled in a course.
 * Returns { enrollment, index } or throws an Error (that asyncHandler will catch).
 *
 * @param {Object}  user     – Mongoose User document
 * @param {string}  courseId – The course ID
 * @param {Object}  res      – Express response object (used to set status before throw)
 * @returns {{ enrollment: object, index: number }}
 */
export const requireEnrollment = (user, courseId, res) => {
    const { enrollment, index } = findEnrollment(user, courseId);

    if (!enrollment) {
        res.status(403);
        throw new Error(ERROR_MESSAGES.MUST_ENROLL);
    }

    return { enrollment, index };
};

/**
 * Convert an old-format enrollment (plain ObjectId) into the new object format
 * and persist the change back into the user's array.
 *
 * @param {Object}   user            – Mongoose User document
 * @param {number}   enrollmentIndex – index inside enrolledCourses
 * @param {string}   courseId        – course ID
 * @param {Object}   [extra={}]      – extra fields to merge (e.g. lastWatchedVideo)
 * @returns {Object} the new enrollment entry
 */
export const migrateEnrollmentFormat = (user, enrollmentIndex, courseId, extra = {}) => {
    user.enrolledCourses[enrollmentIndex] = {
        course: courseId,
        enrolledAt: new Date(),
        videoProgress: [],
        ...extra,
    };
    return user.enrolledCourses[enrollmentIndex];
};
