import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'طلباتي',
    description: 'عرض وتتبع جميع طلبات الشراء الخاصة بك على منصة مسار.',
};

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
    return children;
}
