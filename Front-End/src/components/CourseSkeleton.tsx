export default function CourseSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 animate-pulse">
      {/* صورة */}
      <div className="h-48 bg-slate-200"></div>
      
      {/* محتوى */}
      <div className="p-5">
        {/* عنوان */}
        <div className="h-6 bg-slate-200 rounded mb-3"></div>
        <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
        
        {/* وصف */}
        <div className="h-4 bg-slate-200 rounded mb-2"></div>
        <div className="h-4 bg-slate-200 rounded w-5/6 mb-4"></div>
        
        {/* مدرس */}
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-full bg-slate-200"></div>
          <div className="flex-1">
            <div className="h-3 bg-slate-200 rounded w-1/4 mb-1"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          </div>
        </div>
        
        {/* إحصائيات */}
        <div className="flex gap-3 mb-4">
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
        </div>
        
        {/* زر */}
        <div className="h-10 bg-slate-200 rounded-xl"></div>
      </div>
    </div>
  );
}
