import Header from '@/components/Header';
import Link from 'next/link';

export const metadata = {
  title: 'الشروط والأحكام | مسار التعليمية',
  description: 'اقرأ شروط وأحكام استخدام منصة مسار التعليمية.',
};

const sections = [
  {
    id: 'acceptance',
    title: '١. القبول بالشروط',
    content: [
      'باستخدامك منصة مسار، بتوافق على الالتزام بالشروط والأحكام دي.',
      'لو مش موافق على أي بند، يرجى عدم استخدام المنصة.',
      'الشروط دي بتتطبق على كل المستخدمين: طلاب، مدربين، وزوار.',
    ],
  },
  {
    id: 'account',
    title: '٢. حسابك على المنصة',
    content: [
      'لازم تكون فوق ١٣ سنة عشان تسجّل حساب.',
      'أنت مسؤول عن الحفاظ على سرية كلمة المرور بتاعتك.',
      'ممنوع مشاركة حسابك مع أي شخص تاني.',
      'لو اشتبهت في أي نشاط غير مصرح به على حسابك، بلّغنا فوراً.',
      'إحنا محتفظين بحق تعليق أو حذف أي حساب بيخالف الشروط دي.',
    ],
  },
  {
    id: 'courses',
    title: '٣. الكورسات والمحتوى',
    content: [
      'كل الكورسات والمحتوى التعليمي على المنصة محمي بحقوق الملكية الفكرية.',
      'لما بتشتري كورس، بتحصل على رخصة شخصية وغير قابلة للتحويل لمشاهدة المحتوى.',
      'ممنوع منعاً باتاً تصوير الكورسات أو إعادة نشرها أو توزيعها.',
      'ممنوع استخدام المحتوى لأغراض تجارية بدون إذن كتابي مسبق.',
      'بتفهم إن بعض الكورسات ممكن تتحدث أو تتعدل من وقت لآخر.',
    ],
  },
  {
    id: 'payment',
    title: '٤. الدفع والأسعار',
    content: [
      'أسعار الكورسات محددة بالجنيه المصري أو العملة المعروضة.',
      'بنستخدم بوابات دفع آمنة ومشفّرة.',
      'الدفع يتم مرة واحدة للكورس (مش اشتراك شهري إلا لو مكتوب صريح).',
      'الأسعار ممكن تتغير في أي وقت، لكن الكورسات اللي اشتريتها بالفعل مش بتتأثر.',
    ],
  },
  {
    id: 'refund',
    title: '٥. سياسة الاسترداد',
    content: [
      'بنقبل طلبات الاسترداد خلال ٧ أيام من تاريخ الشراء.',
      'الاسترداد بيتم لو مشاهدتش أكتر من ٢٠٪ من محتوى الكورس.',
      'مش بنقبل طلبات الاسترداد بعد ٧ أيام أو لو اكتملت المشاهدة.',
      'الاسترداد بيتم بنفس طريقة الدفع الأصلية خلال ٥-١٠ أيام عمل.',
      'تواصل مع الدعم على support@masar.com لطلب الاسترداد.',
    ],
  },
  {
    id: 'conduct',
    title: '٦. قواعد السلوك',
    content: [
      'ممنوع نشر أي محتوى مسيء أو تمييزي في التعليقات.',
      'ممنوع مضايقة الطلاب أو المدربين أو موظفي المنصة.',
      'ممنوع محاولة اختراق المنصة أو التلاعب بأي بيانات.',
      'ممنوع استخدام المنصة لأغراض غير قانونية.',
      'مخالفة القواعد دي ممكن تؤدي لحذف حسابك فوراً.',
    ],
  },
  {
    id: 'certificates',
    title: '٧. الشهادات',
    content: [
      'بتحصل على شهادة إتمام بعد إنهاء الكورس بنسبة ١٠٠٪.',
      'الشهادات صادرة من منصة مسار وممكن تشاركها على LinkedIn.',
      'الشهادات مش شهادات أكاديمية معتمدة حكومياً إلا لو صرّح بذلك.',
    ],
  },
  {
    id: 'liability',
    title: '٨. حدود المسؤولية',
    content: [
      'المنصة متاحة "كما هي" ومش بنضمن خلوها من أي أخطاء تقنية.',
      'مش بنتحمل مسؤولية أي خسائر ناتجة عن استخدام المنصة.',
      'مسؤوليتنا القانونية محدودة بقيمة ما دفعته مقابل الكورس.',
    ],
  },
  {
    id: 'changes',
    title: '٩. تعديل الشروط',
    content: [
      'إحنا محتفظين بحق تعديل الشروط دي في أي وقت.',
      'هنبلغك بأي تغيير جوهري عن طريق البريد الإلكتروني.',
      'استمرارك في استخدام المنصة بعد التعديل يعني قبولك للشروط الجديدة.',
    ],
  },
  {
    id: 'law',
    title: '١٠. القانون المطبّق',
    content: [
      'الشروط دي تخضع لقانون جمهورية مصر العربية.',
      'في حالة أي نزاع، المحاكم المصرية المختصة هي المرجع.',
    ],
  },
];

export default function TermsPage() {
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
            <h1 className="text-4xl font-bold mb-4">الشروط والأحكام</h1>
            <p className="text-white/75 text-lg max-w-2xl mx-auto">
              اقرأ الشروط دي بعناية قبل ما تستخدم منصة مسار. استخدامك للمنصة بيعني موافقتك عليها.
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

            {/* Contact box */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
              <h3 className="text-lg font-bold text-foreground mb-3">أسئلة عن الشروط؟</h3>
              <p className="text-foreground/60 mb-5">فريقنا القانوني جاهز لمساعدتك.</p>
              <a
                href="mailto:legal@masar.com"
                className="inline-block bg-primary text-white px-7 py-3 rounded-xl hover:bg-primary-dark transition-colors font-medium"
              >
                legal@masar.com
              </a>
            </div>
          </div>
        </section>

        {/* Footer links */}
        <div className="py-8 px-6 border-t border-foreground/10 text-center text-sm text-foreground/50">
          <div className="flex items-center justify-center gap-6">
            <Link href="/about" className="hover:text-primary transition-colors">عن المنصة</Link>
            <span>·</span>
            <Link href="/privacy" className="hover:text-primary transition-colors">سياسة الخصوصية</Link>
            <span>·</span>
            <Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link>
          </div>
        </div>
      </main>
    </>
  );
}
