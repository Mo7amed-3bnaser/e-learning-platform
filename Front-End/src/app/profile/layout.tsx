import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'الملف الشخصي',
    description: 'إدارة حسابك الشخصي وتعديل بياناتك على منصة مسار التعليمية.',
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    return children;
}
