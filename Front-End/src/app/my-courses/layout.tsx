import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'كورساتي',
    description: 'جميع الكورسات التي اشتركت فيها. تابع تقدمك واكمل مشاهدة الدروس.',
};

export default function MyCoursesLayout({ children }: { children: React.ReactNode }) {
    return children;
}
