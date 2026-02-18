import Header from '@/components/Header';
import Link from 'next/link';
import { FiBook, FiUsers, FiAward, FiTarget, FiMail, FiPhone } from 'react-icons/fi';

export const metadata = {
  title: 'عن منصة مسار | مسار التعليمية',
  description: 'تعرف على منصة مسار التعليمية، رؤيتها، رسالتها، وقيمها في تقديم أفضل تجربة تعليمية عربية.',
};

const stats = [
  { icon: FiUsers, value: '+١٠٠٠', label: 'طالب مسجّل' },
  { icon: FiBook,  value: '+٥٠',   label: 'كورس متاح' },
  { icon: FiAward, value: '+٣٠',   label: 'مدرّب محترف' },
  { icon: FiTarget,value: '٩٨٪',   label: 'نسبة رضا الطلاب' },
];

const values = [
  {
    title: 'الجودة أولاً',
    description: 'كل كورس بيمر بمراجعة دقيقة عشان يوصلك المحتوى بأعلى مستوى ممكن.',
  },
  {
    title: 'تعليم بالعربي',
    description: 'بنقدم المحتوى بلغة عربية واضحة وسهلة، لأن التعلم بلغتك الأم أسرع وأعمق.',
  },
  {
    title: 'مجتمع داعم',
    description: 'مش بس كورسات، ده مجتمع متكامل من الطلاب والمدربين بيدعم بعض.',
  },
  {
    title: 'تحديث مستمر',
    description: 'المحتوى بيتحدث باستمرار عشان يواكب أحدث التطورات في كل مجال.',
  },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background text-foreground pt-[72px]">

        {/* Hero */}
        <section className="relative overflow-hidden bg-primary text-white py-20 px-6">
          <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_20%_50%,#f97316_0%,transparent_50%),radial-gradient(circle_at_80%_20%,#2d5a8a_0%,transparent_50%)]" />
          <div className="relative container mx-auto max-w-4xl text-center">
            <span className="inline-block bg-accent/20 text-accent border border-accent/30 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              عن المنصة
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              مسار — رحلتك نحو المعرفة
            </h1>
            <p className="text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl mx-auto">
              منصة تعليمية عربية متكاملة بتقدم محتوى عالي الجودة في مجالات البرمجة، التصميم،
              الأعمال، وغيرها من التخصصات اللي بتغير مسار حياتك.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 bg-background border-b border-foreground/10">
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map(({ icon: Icon, value, label }) => (
                <div key={label} className="text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <p className="text-3xl font-bold text-primary">{value}</p>
                  <p className="text-sm text-foreground/60 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20 px-6">
          <div className="container mx-auto max-w-5xl">
            <div className="grid md:grid-cols-2 gap-10">
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-5">
                  <FiTarget className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-4">رسالتنا</h2>
                <p className="text-foreground/70 leading-relaxed">
                  نوفر تعليماً رقمياً عربياً عالي الجودة ومتاحاً للجميع، بيمكّن الأفراد من
                  اكتساب المهارات اللي بتساعدهم يحققوا أهدافهم المهنية والشخصية.
                </p>
              </div>
              <div className="bg-accent/5 border border-accent/20 rounded-2xl p-8">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-5">
                  <FiAward className="w-6 h-6 text-accent" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-4">رؤيتنا</h2>
                <p className="text-foreground/70 leading-relaxed">
                  نكون المنصة التعليمية العربية الأولى اللي بتربط الطلاب بأفضل المدربين
                  وبتفتح أمامهم أبواب الفرص في كل مكان في العالم.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 px-6 bg-foreground/3">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-foreground mb-4">قيمنا</h2>
              <p className="text-foreground/60 max-w-xl mx-auto">
                القيم دي هي اللي بتوجه كل قرار بنأخذه في مسار.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {values.map(({ title, description }) => (
                <div
                  key={title}
                  className="bg-background border border-foreground/10 rounded-2xl p-7 hover:border-primary/40 hover:shadow-lg transition-all duration-300"
                >
                  <h3 className="text-lg font-bold text-foreground mb-3">{title}</h3>
                  <p className="text-foreground/60 leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA / Contact */}
        <section className="py-20 px-6">
          <div className="container mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">تواصل معنا</h2>
            <p className="text-foreground/60 mb-10">
              عندك سؤال أو اقتراح؟ إحنا هنا.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="mailto:support@masar.com"
                className="flex items-center gap-3 bg-primary text-white px-7 py-3.5 rounded-xl hover:bg-primary-dark transition-colors font-medium"
              >
                <FiMail className="w-5 h-5" />
                support@masar.com
              </a>
              <a
                href="tel:+201000000000"
                className="flex items-center gap-3 border border-foreground/20 text-foreground px-7 py-3.5 rounded-xl hover:bg-foreground/5 transition-colors font-medium"
              >
                <FiPhone className="w-5 h-5" />
                ٠١٠٠٠٠٠٠٠٠٠
              </a>
            </div>
            <div className="mt-10 flex items-center justify-center gap-6 text-sm text-foreground/50">
              <Link href="/privacy" className="hover:text-primary transition-colors">سياسة الخصوصية</Link>
              <span>·</span>
              <Link href="/terms" className="hover:text-primary transition-colors">الشروط والأحكام</Link>
              <span>·</span>
              <Link href="/courses" className="hover:text-primary transition-colors">تصفح الكورسات</Link>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
