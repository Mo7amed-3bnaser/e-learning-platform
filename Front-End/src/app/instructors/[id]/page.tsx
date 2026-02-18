'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Breadcrumb from '@/components/Breadcrumb';
import CourseCard from '@/components/CourseCard';
import { CourseCardSkeleton } from '@/components/ui';
import { FiMail, FiBook, FiUsers, FiStar, FiAward } from 'react-icons/fi';
import axios from 'axios';
import { handleApiError } from '@/lib/toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Instructor {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    bio?: string;
    role: string;
    createdAt: string;
}

interface Course {
    _id: string;
    title: string;
    description: string;
    price: number;
    thumbnail: string;
    category: string;
    level: string;
    instructor: {
        _id: string;
        name: string;
    };
    rating?: {
        average: number;
        count: number;
    };
    enrolledStudents?: number;
    isPublished: boolean;
}

interface InstructorStats {
    totalCourses: number;
    totalStudents: number;
    averageRating: number;
    totalReviews: number;
}

export default function InstructorProfilePage() {
    const params = useParams();
    const instructorId = params.id as string;

    const [instructor, setInstructor] = useState<Instructor | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [stats, setStats] = useState<InstructorStats>({
        totalCourses: 0,
        totalStudents: 0,
        averageRating: 0,
        totalReviews: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (instructorId) {
            fetchInstructorData();
        }
    }, [instructorId]);

    const fetchInstructorData = async () => {
        try {
            setLoading(true);

            // Fetch instructor info
            const instructorRes = await axios.get(`${API_URL}/users/${instructorId}`);
            setInstructor(instructorRes.data.data);

            // Fetch instructor's courses
            const coursesRes = await axios.get(`${API_URL}/courses?instructor=${instructorId}`);
            const instructorCourses = coursesRes.data.data.filter((c: Course) => c.isPublished);
            setCourses(instructorCourses);

            // Calculate stats
            const totalStudents = instructorCourses.reduce(
                (sum: number, course: Course) => sum + (course.enrolledStudents || 0),
                0
            );

            const ratingsData = instructorCourses
                .filter((c: Course) => c.rating && c.rating.count > 0)
                .map((c: Course) => ({
                    average: c.rating!.average,
                    count: c.rating!.count,
                }));

            const totalReviews = ratingsData.reduce((sum: number, r: { average: number; count: number }) => sum + r.count, 0);
            const weightedSum = ratingsData.reduce((sum: number, r: { average: number; count: number }) => sum + r.average * r.count, 0);
            const averageRating = totalReviews > 0 ? weightedSum / totalReviews : 0;

            setStats({
                totalCourses: instructorCourses.length,
                totalStudents,
                averageRating,
                totalReviews,
            });
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
                <Header />
                <div className="max-w-7xl mx-auto px-4 py-8">
                    {/* Profile Skeleton */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 animate-pulse">
                        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                            <div className="w-32 h-32 bg-gray-300 rounded-full"></div>
                            <div className="flex-1 space-y-4 w-full">
                                <div className="h-8 bg-gray-300 rounded w-1/3"></div>
                                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                                <div className="h-20 bg-gray-300 rounded"></div>
                            </div>
                        </div>
                    </div>

                    {/* Courses Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <CourseCardSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!instructor) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
                <Header />
                <div className="max-w-7xl mx-auto px-4 py-16 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">المدرب غير موجود</h1>
                    <p className="text-gray-600">عذراً، لم نتمكن من العثور على هذا المدرب</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            <Header />

            {/* Instructor Profile Header */}
            <div className="bg-gradient-to-l from-primary to-primary-dark text-white">
                <div className="max-w-7xl mx-auto px-4 py-16">
                    <Breadcrumb items={[{ label: instructor.name }]} variant="dark" className="mb-8" />
                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                        {/* Avatar */}
                        <div className="relative">
                            {instructor.avatar ? (
                                <img
                                    src={instructor.avatar}
                                    alt={instructor.name}
                                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center text-5xl font-bold border-4 border-white shadow-xl">
                                    {instructor.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="absolute -bottom-2 -right-2 bg-accent text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 shadow-lg">
                                <FiAward size={16} />
                                <span>مدرب</span>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-right">
                            <h1 className="text-4xl md:text-5xl font-bold mb-3">{instructor.name}</h1>
                            {instructor.bio && (
                                <p className="text-xl text-white/90 mb-6 max-w-3xl">{instructor.bio}</p>
                            )}

                            {/* Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                        <FiBook className="text-white/80" size={20} />
                                        <span className="text-sm text-white/80">الكورسات</span>
                                    </div>
                                    <p className="text-3xl font-bold">{stats.totalCourses}</p>
                                </div>

                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                        <FiUsers className="text-white/80" size={20} />
                                        <span className="text-sm text-white/80">الطلاب</span>
                                    </div>
                                    <p className="text-3xl font-bold">{stats.totalStudents}</p>
                                </div>

                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                        <FiStar className="text-white/80" size={20} />
                                        <span className="text-sm text-white/80">التقييم</span>
                                    </div>
                                    <p className="text-3xl font-bold">
                                        {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '-'}
                                    </p>
                                </div>

                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                        <FiStar className="text-white/80" size={20} />
                                        <span className="text-sm text-white/80">المراجعات</span>
                                    </div>
                                    <p className="text-3xl font-bold">{stats.totalReviews}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Courses Section */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        كورسات {instructor.name}
                    </h2>
                    <p className="text-gray-600">
                        تصفح جميع الكورسات المتاحة من هذا المدرب
                    </p>
                </div>

                {courses.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                            <FiBook className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            لا توجد كورسات متاحة حالياً
                        </h3>
                        <p className="text-gray-600">
                            لم يقم هذا المدرب بنشر أي كورسات بعد
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <CourseCard key={course._id} course={course} isPurchased={false} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
