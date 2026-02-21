import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'لوحة التحكم',
    description: 'لوحة التحكم الخاصة بك - تابع تقدمك وإحصائياتك على منصة مسار.',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return children;
}
