import { Metadata } from 'next';
import WatchClient from './WatchClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${API_URL}/courses/${id}`, { next: { revalidate: 3600 } });
    if (!res.ok) return { title: 'مشاهدة الكورس | مسار' };
    const data = await res.json();
    const course = data?.data;
    return {
      title: `${course?.title ?? 'كورس'} — مشاهدة | مسار`,
      description: `شاهد محتوى كورس ${course?.title ?? ''} على منصة مسار التعليمية`,
    };
  } catch {
    return { title: 'مشاهدة الكورس | مسار' };
  }
}

export default function WatchPage() {
  return <WatchClient />;
}