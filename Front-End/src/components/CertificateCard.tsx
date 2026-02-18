'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { FiAward, FiDownload, FiRefreshCw, FiPrinter } from 'react-icons/fi';
import { certificatesAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface CertificateData {
  certificateId: string;
  certificateUrl: string | null;
  completedAt: string;
  studentName: string;
}

interface CertificateCardProps {
  courseId: string;
  courseName: string;
  courseProgress: number;
}

type Status = 'idle' | 'loading' | 'ready' | 'error';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3000;

export default function CertificateCard({ courseId, courseName, courseProgress }: CertificateCardProps) {
  const user = useAuthStore((s) => s.user);
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const retriesRef = useRef(0);
  const certRef = useRef<HTMLDivElement>(null);

  // ─── Fetch existing certificate, then generate if not found ─────────────────
  const loadCertificate = useCallback(async (forceGenerate = false) => {
    setStatus('loading');
    try {
      let res;
      if (forceGenerate) {
        res = await certificatesAPI.generateCertificate(courseId);
      } else {
        res = await certificatesAPI.getCertificate(courseId);
      }
      setCertificate(res.data.data);
      setStatus('ready');
      retriesRef.current = 0;
    } catch (err: any) {
      const is404 = err?.response?.status === 404;

      if (is404 && !forceGenerate && retriesRef.current < MAX_RETRIES) {
        // Certificate not generated yet — ask backend to generate it
        retriesRef.current += 1;
        setTimeout(() => loadCertificate(true), RETRY_DELAY_MS);
      } else if (retriesRef.current < MAX_RETRIES) {
        // Transient error — retry same call
        retriesRef.current += 1;
        setTimeout(() => loadCertificate(forceGenerate), RETRY_DELAY_MS);
      } else {
        // Exhausted retries — show a local fallback certificate
        setCertificate(buildFallbackCertificate());
        setStatus('ready');
      }
    }
  }, [courseId]);

  // Build a fallback certificate using local data when backend is unreachable
  const buildFallbackCertificate = (): CertificateData => ({
    certificateId: `CERT-LOCAL-${Date.now().toString(36).toUpperCase()}`,
    certificateUrl: null,
    completedAt: new Date().toISOString(),
    studentName: user?.name ?? 'الطالب',
  });

  useEffect(() => {
    if (courseProgress === 100) {
      retriesRef.current = 0;
      loadCertificate(false);
    }
  }, [courseProgress, courseId, loadCertificate]);

  // ─── Print / download ────────────────────────────────────────────────────────
  const handlePrint = () => {
    if (!certRef.current) return;
    const content = certRef.current.innerHTML;
    const win = window.open('', '_blank', 'width=900,height=650');
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="utf-8"/>
          <title>شهادة إتمام</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Cairo', Arial, sans-serif; background: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
            .cert-wrap { width: 842px; height: 595px; position: relative; }
          </style>
        </head>
        <body>
          <div class="cert-wrap">${content}</div>
          <script>window.onload = () => { window.print(); window.close(); }<\/script>
        </body>
      </html>
    `);
    win.document.close();
  };

  // ─── Nothing to show ────────────────────────────────────────────────────────
  if (courseProgress < 100) return null;

  // ─── Loading state ───────────────────────────────────────────────────────────
  if (status === 'loading' || status === 'idle') {
    return (
      <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center animate-pulse">
            <FiAward className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p className="font-bold text-white">جاري إعداد شهادتك…</p>
            <p className="text-sm text-slate-400">قد يستغرق الأمر بضع ثوانٍ</p>
          </div>
          <div className="mr-auto">
            <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!certificate) return null;

  const completionDate = new Date(certificate.completedAt).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // ─── Visual certificate ──────────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* Header — always on dark bg (watch page uses bg-slate-900) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <FiAward className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="font-bold text-white">🎉 مبروك! أتممت الكورس</p>
            <p className="text-xs text-slate-400">{certificate.certificateId}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            title="طباعة / حفظ PDF"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            <FiPrinter className="w-4 h-4" />
            طباعة
          </button>
          {certificate.certificateUrl && (
            <a
              href={certificate.certificateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
            >
              <FiDownload className="w-4 h-4" />
              PDF
            </a>
          )}
          <button
            onClick={() => { retriesRef.current = 0; loadCertificate(true); }}
            title="إعادة توليد الشهادة"
            className="p-2 rounded-xl border border-slate-600 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <FiRefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Certificate visual */}
      <div className="overflow-auto rounded-2xl border border-foreground/10 shadow-lg bg-white">
        <div
          ref={certRef}
          style={{
            width: '842px',
            height: '595px',
            minWidth: '842px',
            position: 'relative',
            background: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 50%, #f0fff4 100%)',
            fontFamily: "'Cairo', Arial, sans-serif",
            color: '#1a1a2e',
            overflow: 'hidden',
          }}
        >
          {/* Decorative corner borders */}
          <div style={{ position:'absolute', top:18, left:18, width:60, height:60, borderTop:'4px solid #1e3a5f', borderLeft:'4px solid #f97316', borderRadius:'4px 0 0 0' }} />
          <div style={{ position:'absolute', top:18, right:18, width:60, height:60, borderTop:'4px solid #1e3a5f', borderRight:'4px solid #f97316', borderRadius:'0 4px 0 0' }} />
          <div style={{ position:'absolute', bottom:18, left:18, width:60, height:60, borderBottom:'4px solid #1e3a5f', borderLeft:'4px solid #f97316', borderRadius:'0 0 0 4px' }} />
          <div style={{ position:'absolute', bottom:18, right:18, width:60, height:60, borderBottom:'4px solid #1e3a5f', borderRight:'4px solid #f97316', borderRadius:'0 0 4px 0' }} />

          {/* Outer frame */}
          <div style={{ position:'absolute', inset:12, border:'2px solid #1e3a5f', borderRadius:8, opacity:0.15 }} />

          {/* Watermark text */}
          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', opacity:0.04, fontSize:120, fontWeight:900, color:'#1e3a5f', userSelect:'none', pointerEvents:'none' }}>
            مسار
          </div>

          {/* Top ribbon */}
          <div style={{ position:'absolute', top:0, left:0, right:0, height:6, background:'linear-gradient(90deg, #1e3a5f, #f97316, #1e3a5f)' }} />
          <div style={{ position:'absolute', bottom:0, left:0, right:0, height:6, background:'linear-gradient(90deg, #1e3a5f, #f97316, #1e3a5f)' }} />

          {/* Content */}
          <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:0, padding:'40px 80px', textAlign:'center' }}>

            {/* Platform name */}
            <p style={{ fontSize:13, letterSpacing:6, color:'#f97316', fontWeight:700, textTransform:'uppercase', marginBottom:6 }}>
              منصة مسار التعليمية
            </p>

            {/* Main title */}
            <h1 style={{ fontSize:38, fontWeight:900, color:'#1e3a5f', lineHeight:1.1, marginBottom:4 }}>
              شهادة إتمام
            </h1>
            <p style={{ fontSize:13, color:'#64748b', letterSpacing:3, marginBottom:24 }}>
              Certificate of Completion
            </p>

            {/* Divider */}
            <div style={{ width:120, height:2, background:'linear-gradient(90deg, transparent, #f97316, transparent)', marginBottom:20 }} />

            {/* "This certifies that" */}
            <p style={{ fontSize:14, color:'#475569', marginBottom:8 }}>
              يُشهد بأن الطالب / الطالبة
            </p>

            {/* Student name */}
            <h2 style={{ fontSize:32, fontWeight:900, color:'#1e3a5f', marginBottom:16, borderBottom:'2px solid #f97316', paddingBottom:6, minWidth:200 }}>
              {certificate.studentName}
            </h2>

            {/* Course completion */}
            <p style={{ fontSize:14, color:'#475569', marginBottom:8 }}>
              قد أتم بنجاح كورس
            </p>
            <h3 style={{ fontSize:20, fontWeight:700, color:'#0d2137', marginBottom:24, maxWidth:500 }}>
              {courseName}
            </h3>

            {/* Footer row */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%', marginTop:4 }}>
              <div style={{ textAlign:'center' }}>
                <p style={{ fontSize:11, color:'#94a3b8', marginBottom:2 }}>تاريخ الإتمام</p>
                <p style={{ fontSize:13, fontWeight:700, color:'#334155' }}>{completionDate}</p>
              </div>
              <div style={{ width:2, height:32, background:'#e2e8f0' }} />
              <div style={{ textAlign:'center' }}>
                <div style={{ width:48, height:48, borderRadius:'50%', border:'2px solid #1e3a5f', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 2px' }}>
                  <span style={{ fontSize:20, fontWeight:900, color:'#1e3a5f' }}>م</span>
                </div>
                <p style={{ fontSize:10, color:'#94a3b8' }}>مسار</p>
              </div>
              <div style={{ width:2, height:32, background:'#e2e8f0' }} />
              <div style={{ textAlign:'center' }}>
                <p style={{ fontSize:11, color:'#94a3b8', marginBottom:2 }}>رقم الشهادة</p>
                <p style={{ fontSize:11, fontWeight:700, color:'#334155', fontFamily:'monospace', letterSpacing:1 }}>{certificate.certificateId}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-center text-slate-500">
        اضغط "طباعة" لحفظ الشهادة كـ PDF أو طباعتها
      </p>
    </div>
  );
}
