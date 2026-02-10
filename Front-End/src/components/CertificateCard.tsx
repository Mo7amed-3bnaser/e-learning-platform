'use client';

import { useState, useEffect } from 'react';
import { FiAward, FiDownload, FiCheck, FiClock } from 'react-icons/fi';
import { certificatesAPI } from '@/lib/api';

interface CertificateCardProps {
  courseId: string;
  courseName: string;
  courseProgress: number;
}

export default function CertificateCard({ courseId, courseName, courseProgress }: CertificateCardProps) {
  const [certificate, setCertificate] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (courseProgress === 100) {
      fetchCertificate();
    }
  }, [courseProgress, courseId]);

  const fetchCertificate = async () => {
    try {
      const response = await certificatesAPI.getCertificate(courseId);
      setCertificate(response.data.data);
      setIsLoading(false);
    } catch (error) {
      // Certificate not ready yet - retry after 2 seconds (max 10 retries = 20 seconds)
      if (retryCount < 10) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchCertificate();
        }, 2000);
      } else {
        setIsLoading(false);
      }
    }
  };

  if (courseProgress < 100) {
    return null;
  }

  // Don't show anything while loading (cleaner UX)
  if (isLoading && retryCount === 0) {
    return null;
  }

  // If still loading after first attempt, show generating message
  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-200 rounded-2xl p-8 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center animate-pulse">
              <FiAward className="w-7 h-7 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <FiClock className="w-3 h-3 text-white animate-spin" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-1">جاري إنشاء شهادتك...</h3>
            <p className="text-sm text-slate-600">قد يستغرق الأمر بضع ثوانٍ</p>
          </div>
        </div>
      </div>
    );
  }

  if (!certificate) {
    return null; // Don't show anything if certificate not found after retries
  }

  const handleDownload = () => {
    window.open(certificate.certificateUrl, '_blank');
  };

  return (
    <div className="bg-gradient-to-br from-emerald-500/10 via-green-500/10 to-teal-500/10 border-2 border-emerald-300/50 rounded-2xl p-8 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
            <FiAward className="w-8 h-8 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-md">
            <FiCheck className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-slate-800 mb-1 flex items-center gap-2">
            🎉 مبروك! حصلت على الشهادة
          </h3>
          <p className="text-sm text-slate-600 flex items-center gap-2">
            <span>تاريخ الإكمال:</span>
            <span className="font-semibold text-emerald-700">
              {new Date(certificate.completedAt).toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </p>
        </div>
      </div>

      {/* Certificate ID */}
      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 mb-6 border border-emerald-200/50">
        <p className="text-xs text-slate-600 mb-1">رقم الشهادة</p>
        <p className="font-mono text-lg font-bold text-emerald-700 tracking-wider">
          {certificate.certificateId}
        </p>
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        className="w-full flex items-center justify-center gap-3 bg-gradient-to-l from-emerald-500 via-green-500 to-teal-500 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 group"
      >
        <FiDownload className="w-6 h-6 group-hover:animate-bounce" />
        <span>تحميل الشهادة (PDF)</span>
      </button>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-400/10 rounded-full blur-3xl -z-10"></div>
    </div>
  );
}
