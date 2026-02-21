import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'تصفح الكورسات',
    description: 'اكتشف مجموعة واسعة من الكورسات في البرمجة والتصميم والأعمال. فلتر حسب التصنيف والمستوى والسعر.',
    openGraph: {
        title: 'تصفح الكورسات | مسار التعليمية',
        description: 'اكتشف مجموعة واسعة من الكورسات في البرمجة والتصميم والأعمال.',
    },
};

export default function CoursesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
