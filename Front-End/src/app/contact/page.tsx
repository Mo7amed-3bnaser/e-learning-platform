import type { Metadata } from 'next';
import Header from '@/components/Header';
import Breadcrumb from '@/components/Breadcrumb';
import { FiMail, FiPhone, FiMapPin, FiClock, FiMessageCircle, FiSend } from 'react-icons/fi';

export const metadata: Metadata = {
  title: 'تواصل معنا | مسار التعليمية',
  description: 'تواصل مع فريق منصة مسار التعليمية — نحن هنا للإجابة على استفساراتك ومساعدتك في رحلتك التعليمية.',
};

const contactInfo = [
  {
    icon: FiMail,
    title: 'البريد الإلكتروني',
    value: 'support@masar.edu',
    href: 'mailto:support@masar.edu',
    desc: 'نرد خلال 24 ساعة',
  },
  {
    icon: FiPhone,
    title: 'رقم الهاتف',
    value: '+20 100 000 0000',
    href: 'tel:+201000000000',
    desc: 'من السبت إلى الخميس',
  },
  {
    icon: FiMapPin,
    title: 'الموقع',
    value: 'سوهاج، مصر',
    href: null,
    desc: 'المقر الرئيسي للمنصة',
  },
  {
    icon: FiClock,
    title: 'ساعات العمل',
    value: '٩ص — ٦م',
    href: null,
    desc: 'السبت إلى الخميس',
  },
];

const faqs = [
  {
    q: 'كيف يمكنني الاشتراك في كورس؟',
    a: 'بعد إنشاء حساب وتسجيل الدخول، اختر الكورس الذي يناسبك، ثم اضغط "اشتر الآن" وأكمل خطوات الدفع.',
  },
  {
    q: 'ما هي طرق الدفع المتاحة؟',
    a: 'ندعم فودافون كاش، انستاباي، والتحويل البنكي. بعد الدفع، أرسل صورة الإيصال وسيتم تفعيل الكورس خلال 24 ساعة.',
  },
  {
    q: 'هل يمكنني مشاهدة الكورس على أي جهاز؟',
    a: 'نعم، يمكنك الوصول من أي جهاز. لحماية المحتوى، يُسمح بجهازين مختلفين شهرياً لنفس الحساب.',
  },
  {
    q: 'كيف أحصل على شهادة الإتمام؟',
    a: 'عند إتمام مشاهدة جميع دروس الكورس (100%)، تُصدر شهادتك تلقائياً ويمكنك تنزيلها من لوحة تحكم الطالب.',
  },
  {
    q: 'هل يمكنني أن أصبح مدرباً على المنصة؟',
    a: 'بالتأكيد! قدّم طلب انضمام من صفحة "كن مدرباً" وسيراجع الفريق طلبك ويرد عليك في أقرب وقت.',
  },
];

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background text-foreground pt-18" dir="rtl">

        {/* Hero */}
        <section className="relative overflow-hidden bg-primary text-white py-20 px-6">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_50%,#f97316_0%,transparent_50%),radial-gradient(circle_at_80%_20%,#2d5a8a_0%,transparent_50%)]" />
          <div className="relative container mx-auto max-w-4xl text-center">
            <Breadcrumb
              items={[{ label: 'تواصل معنا' }]}
              variant="dark"
              className="mb-5 justify-center"
            />
            <span className="inline-block bg-accent/20 text-accent border border-accent/30 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              نحن هنا لمساعدتك
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              تواصل مع فريق مسار
            </h1>
            <p className="text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl mx-auto">
              عندك سؤال، مشكلة، أو اقتراح؟ فريقنا جاهز لمساعدتك في أي وقت.
            </p>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-16 px-6 bg-background">
          <div className="container mx-auto max-w-5xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {contactInfo.map(({ icon: Icon, title, value, href, desc }) => (
                <div
                  key={title}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:border-primary/40 dark:hover:border-primary/50 hover:shadow-md transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary dark:text-primary-light" />
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-1 text-sm uppercase tracking-wide">
                    {title}
                  </h3>
                  {href ? (
                    <a
                      href={href}
                      className="text-primary dark:text-primary-light font-semibold hover:underline block mb-1"
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="text-primary dark:text-primary-light font-semibold mb-1">{value}</p>
                  )}
                  <p className="text-slate-500 dark:text-slate-400 text-xs">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
          <div className="container mx-auto max-w-3xl">
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 text-accent font-semibold text-sm tracking-widest uppercase mb-3">
                <FiMessageCircle className="w-4 h-4" />
                أسئلة شائعة
              </span>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                الأسئلة الأكثر شيوعاً
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                لم تجد إجابتك؟ تواصل معنا مباشرةً
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map(({ q, a }, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700"
                >
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">
                      {i + 1}
                    </span>
                    {q}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed pr-9">
                    {a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-6 bg-background border-t border-slate-100 dark:border-slate-800">
          <div className="container mx-auto max-w-xl text-center">
            <div className="bg-linear-to-br from-primary to-primary-dark rounded-3xl p-10 text-white shadow-xl">
              <FiSend className="w-10 h-10 mx-auto mb-4 opacity-80" />
              <h2 className="text-2xl font-bold mb-3">ابعت لنا رسالة</h2>
              <p className="text-white/80 mb-6 text-sm leading-relaxed">
                تواصل معنا عبر البريد الإلكتروني وهنرد عليك في أقرب وقت ممكن.
              </p>
              <a
                href="mailto:support@masar.edu"
                className="inline-flex items-center gap-2 bg-white text-primary font-bold px-8 py-3 rounded-xl hover:bg-slate-50 transition-colors shadow-md hover:shadow-lg"
              >
                <FiMail className="w-4 h-4" />
                support@masar.edu
              </a>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
