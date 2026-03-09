import { Metadata } from 'next';
import CheckoutClient from './CheckoutClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${API_URL}/courses/${id}`, { next: { revalidate: 3600 } });
    if (!res.ok) return { title: 'إتمام الشراء | مسار' };
    const data = await res.json();
    const course = data?.data;
    return {
      title: `إتمام شراء: ${course?.title ?? 'كورس'} | مسار`,
      description: `أكمل عملية شراء كورس ${course?.title ?? ''} على منصة مسار التعليمية`,
    };
  } catch {
    return { title: 'إتمام الشراء | مسار' };
  }
}

export default function CheckoutPage() {
  return <CheckoutClient />;
}