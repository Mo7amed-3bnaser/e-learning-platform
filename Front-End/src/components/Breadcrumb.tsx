import Link from 'next/link';
import { FiHome } from 'react-icons/fi';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  /**
   * light  → dark text, for white/light backgrounds
   * dark   → white text, for dark/colored backgrounds
   * auto   → adapts to dark:/light: theme (default)
   */
  variant?: 'light' | 'dark' | 'auto';
}

export default function Breadcrumb({ items, className = '', variant = 'auto' }: BreadcrumbProps) {
  const linkClass =
    variant === 'dark'
      ? 'text-white/60 hover:text-white'
      : variant === 'light'
      ? 'text-slate-500 hover:text-primary'
      : 'text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary-light';

  const currentClass =
    variant === 'dark'
      ? 'text-white font-medium'
      : variant === 'light'
      ? 'text-slate-800 font-medium'
      : 'text-slate-800 dark:text-slate-100 font-medium';

  const separatorClass =
    variant === 'dark'
      ? 'text-white/30'
      : variant === 'light'
      ? 'text-slate-300'
      : 'text-slate-300 dark:text-slate-600';

  return (
    <nav aria-label="مسار التنقل" className={`flex items-center flex-wrap gap-1 text-sm ${className}`}>
      <Link href="/" className={`flex items-center gap-1 transition-colors ${linkClass}`}>
        <FiHome className="w-3.5 h-3.5 shrink-0" />
        <span>الرئيسية</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={index} className="flex items-center gap-1">
            <span className={separatorClass} aria-hidden="true">/</span>
            {isLast || !item.href ? (
              <span className={`truncate max-w-[160px] sm:max-w-xs ${currentClass}`} aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link href={item.href} className={`transition-colors ${linkClass}`}>
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
