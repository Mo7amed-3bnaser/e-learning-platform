import Header from '@/components/Header';
import Link from 'next/link';

export const metadata = {
  title: 'سياسة الخصوصية | مسار التعليمية',
  description: 'اقرأ سياسة الخصوصية الخاصة بمنصة مسار التعليمية، وكيف نحمي بياناتك.',
};

const sections = [
  {
    id: 'collect',
    title: '١. البيانات اللي بنجمعها',
    content: [
      'بيانات التسجيل: الاسم، البريد الإلكتروني، رقم الهاتف، وكلمة المرور (مشفّرة).',
      'بيانات الاستخدام: الكورسات اللي اشتريتها، التقدم في المشاهدة، التعليقات اللي كتبتها.',
      'البيانات التقنية: عنوان IP، نوع المتصفح، نظام التشغيل — وده بيساعدنا نحسّن تجربتك.',
      'بيانات الدفع: بنستخدم بوابات دفع آمنة ومشفّرة ومش بنحتفظ ببيانات بطاقتك.',
    ],
  },
  {
    id: 'use',
    title: '٢. إزاي بنستخدم بياناتك',
    content: [
      'عشان نوفرلك تجربة التعلم وتتبع تقدمك.',
      'عشان نبعتلك إشعارات مهمة عن الكورسات والعروض.',
      'عشان نحسّن المنصة ونضيف محتوى جديد بناءً على اهتماماتك.',
      'عشان نتواصل معاك في حالة وجود مشكلة في حسابك.',
    ],
  },
  {
    id: 'share',
    title: '٣. مشاركة البيانات مع الغير',
    content: [
      'ما بنشاركش بياناتك الشخصية مع أطراف ثالثة إلا في الحالات دي:',
      'مزودي خدمات الدفع لإتمام عملية الشراء (ومش بيشوفوا كلمة المرور).',
      'المدربين بخصوص أداء كورساتهم — ومش بيشوفوا بياناتك الشخصية الكاملة.',
      'السلطات القانونية لو الأمر استدعى ده بموجب قانون.',
    ],
  },
  {
    id: 'security',
    title: '٤. أمان البيانات',
    content: [
      'بنستخدم تشفير SSL/TLS لحماية البيانات أثناء النقل.',
      'كلمات المرور مشفّرة باستخدام bcrypt وما بنشوفهاش.',
      'الوصول للبيانات مقيّد بموظفين محددين فقط.',
      'بنراجع أنظمة الأمان بانتظام ونحدّثها.',
    ],
  },
  {
    id: 'rights',
    title: '٥. حقوقك',
    content: [
      'حق الوصول: تقدر تطلب نسخة من بياناتك الشخصية.',
      'حق التصحيح: تقدر تعدّل بياناتك في أي وقت من صفحة الملف الشخصي.',
      'حق الحذف: تقدر تطلب حذف حسابك وبياناتك بالكامل.',
      'حق الاعتراض: تقدر ترفض تلقي رسائل تسويقية.',
    ],
  },
  {
    id: 'cookies',
    title: '٦. ملفات تعريف الارتباط (Cookies)',
    content: [
      'بنستخدم Cookies ضرورية لتشغيل المنصة (زي جلسة الدخول).',
      'Cookies التحليل عشان نفهم إزاي بتستخدم المنصة.',
      'تقدر تتحكم في الـ Cookies من إعدادات متصفحك.',
    ],
  },
  {
    id: 'children',
    title: '٧. الأطفال',
    content: [
      'المنصة موجهة للأفراد فوق ١٣ سنة.',
      'لو اكتشفنا إن طفل تحت ١٣ سجّل حساب، هنحذف الحساب فوراً.',
    ],
  },
  {
    id: 'changes',
    title: '٨. تعديلات السياسة',
    content: [
      'ممكن نعدّل السياسة دي من وقت لآخر.',
      'هنبلغك بأي تغيير مهم عن طريق البريد الإلكتروني أو إشعار على المنصة.',
      'استمرارك في استخدام المنصة بعد التعديل يعني موافقتك.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background text-foreground pt-[72px]">

        {/* Hero */}
        <section className="bg-primary text-white py-16 px-6">
          <div className="container mx-auto max-w-4xl text-center">
            <span className="inline-block bg-white/10 border border-white/20 px-4 py-1.5 rounded-full text-sm font-medium mb-5">
              آخر تحديث: يناير ٢٠٢٦
            </span>
            <h1 className="text-4xl font-bold mb-4">سياسة الخصوصية</h1>
            <p className="text-white/75 text-lg max-w-2xl mx-auto">
              في مسار، خصوصيتك أمانة عندنا. اقرأ السياسة دي عشان تفهم إزاي بنتعامل مع بياناتك.
            </p>
          </div>
        </section>

        {/* Table of Contents */}
        <section className="py-10 px-6 border-b border-foreground/10">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-sm font-semibold text-foreground/50 uppercase tracking-wider mb-4">محتويات الصفحة</h2>
            <div className="flex flex-wrap gap-3">
              {sections.map(({ id, title }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="text-sm bg-primary/8 text-primary border border-primary/20 px-4 py-2 rounded-lg hover:bg-primary/15 transition-colors"
                >
                  {title.split('.')[0]}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Sections */}
        <section className="py-16 px-6">
          <div className="container mx-auto max-w-4xl space-y-14">
            {sections.map(({ id, title, content }) => (
              <div key={id} id={id} className="scroll-mt-24">
                <h2 className="text-xl font-bold text-foreground mb-5 pb-3 border-b border-foreground/10">
                  {title}
                </h2>
                <ul className="space-y-3">
                  {content.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-foreground/70 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Contact */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
              <h3 className="text-lg font-bold text-foreground mb-3">لو عندك سؤال عن سياسة الخصوصية</h3>
              <p className="text-foreground/60 mb-5">تواصل مع فريقنا وهنرد عليك في أقرب وقت.</p>
              <a
                href="mailto:privacy@masar.com"
                className="inline-block bg-primary text-white px-7 py-3 rounded-xl hover:bg-primary-dark transition-colors font-medium"
              >
                privacy@masar.com
              </a>
            </div>
          </div>
        </section>

        {/* Footer links */}
        <div className="py-8 px-6 border-t border-foreground/10 text-center text-sm text-foreground/50">
          <div className="flex items-center justify-center gap-6">
            <Link href="/about" className="hover:text-primary transition-colors">عن المنصة</Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-primary transition-colors">الشروط والأحكام</Link>
            <span>·</span>
            <Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link>
          </div>
        </div>
      </main>
    </>
  );
}
