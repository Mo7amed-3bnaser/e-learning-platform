import Link from "next/link";
import Logo from "@/components/Logo";
import { FiArrowLeft, FiBook, FiAward, FiUsers, FiTrendingUp } from "react-icons/fi";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <Logo size="md" />
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="px-6 py-2.5 text-slate-700 hover:text-primary font-medium transition-colors"
            >
              تسجيل الدخول
            </Link>
            <Link
              href="/register"
              className="px-6 py-2.5 bg-gradient-to-l from-primary to-primary-dark text-white rounded-xl hover:from-primary-dark hover:to-primary transition-all shadow-sm hover:shadow-md"
            >
              إنشاء حساب
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="space-y-6 text-right">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                منصة التعلم الإلكتروني الأولى
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                ابدأ رحلتك نحو
                <span className="text-primary block mt-2">النجاح والتميز</span>
              </h1>
              
              <p className="text-xl text-slate-600 leading-relaxed">
                انضم إلى آلاف المتعلمين واكتشف مسارك التعليمي المثالي مع أفضل الدورات والمدربين المحترفين
              </p>

              <div className="flex gap-4 pt-4">
                <Link
                  href="/register"
                  className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-l from-primary to-primary-dark text-white rounded-xl hover:from-primary-dark hover:to-primary transition-all shadow-lg hover:shadow-xl font-semibold"
                >
                  ابدأ الآن مجاناً
                  <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/login"
                  className="flex items-center gap-3 px-8 py-4 border-2 border-slate-200 text-slate-700 rounded-xl hover:border-primary hover:text-primary transition-all font-semibold"
                >
                  تسجيل الدخول
                </Link>
              </div>
            </div>

            {/* Image/Illustration */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 rounded-3xl p-8 backdrop-blur-sm border border-primary/20">
                {/* Stats Cards */}
                <div className="space-y-4">
                  <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                        <FiBook className="w-7 h-7 text-primary" />
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-slate-900">+500</div>
                        <div className="text-slate-600">دورة تعليمية</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow mr-8">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center">
                        <FiUsers className="w-7 h-7 text-accent" />
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-slate-900">+10K</div>
                        <div className="text-slate-600">طالب نشط</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                        <FiAward className="w-7 h-7 text-primary" />
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-slate-900">+50</div>
                        <div className="text-slate-600">مدرب خبير</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-accent/20 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">لماذا مسار؟</h2>
              <p className="text-xl text-slate-600">المنصة الأكثر تطوراً للتعلم عبر الإنترنت</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: FiBook,
                  title: "دورات متنوعة",
                  desc: "محتوى تعليمي شامل في جميع المجالات",
                },
                {
                  icon: FiAward,
                  title: "شهادات معتمدة",
                  desc: "احصل على شهادات موثقة بعد إتمام الدورات",
                },
                {
                  icon: FiUsers,
                  title: "مدربون محترفون",
                  desc: "تعلم من خبراء في مجالاتهم",
                },
                {
                  icon: FiTrendingUp,
                  title: "تطور مستمر",
                  desc: "تحديثات دورية وإضافة محتوى جديد",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="group p-6 rounded-2xl border-2 border-slate-100 hover:border-primary/50 hover:shadow-lg transition-all text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary-dark to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-64 h-64 bg-accent/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-primary-light/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              جاهز لبدء رحلتك التعليمية؟
            </h2>
            <p className="text-xl text-white/80 mb-8">
              انضم إلى مجتمع مسار اليوم واحصل على وصول فوري لجميع الدورات
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-3 px-10 py-4 bg-white text-primary rounded-xl hover:bg-slate-50 transition-all shadow-xl hover:shadow-2xl font-bold text-lg"
            >
              إنشاء حساب مجاني
              <FiArrowLeft />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Logo size="md" showText={true} className="text-white" />
            <p className="text-slate-400">© 2026 مسار - جميع الحقوق محفوظة</p>
            <div className="flex gap-6">
              <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                سياسة الخصوصية
              </Link>
              <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                الشروط والأحكام
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
