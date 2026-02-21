import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'قائمة الرغبات',
    description: 'الكورسات المفضلة التي تريد الالتحاق بها لاحقاً على منصة مسار.',
};

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
    return children;
}
