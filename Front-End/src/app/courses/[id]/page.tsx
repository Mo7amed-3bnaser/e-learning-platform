import { Metadata } from 'next';
import CourseDetailsClient from './CourseDetailsClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${API_URL}/courses/${id}`, { next: { revalidate: 3600 } });
    if (!res.ok) return { title: 'كورس | مسار' };
    const data = await res.json();
    const course = data?.data;
    return {
      title: `${course?.title ?? 'كورس'} | مسار`,
      description: course?.description ?? 'تعلم مهارات جديدة مع مسار',
      openGraph: {
        title: `${course?.title ?? 'كورس'} | مسار`,
        description: course?.description ?? 'تعلم مهارات جديدة مع مسار',
        images: course?.thumbnail ? [{ url: course.thumbnail }] : [],
        type: 'website',
      },
    };
  } catch {
    return { title: 'كورس | مسار' };
  }
}

export default function CoursePage() {
  return <CourseDetailsClient />;
}