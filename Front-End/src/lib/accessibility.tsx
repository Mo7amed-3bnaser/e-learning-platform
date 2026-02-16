// Accessibility utilities and ARIA helpers

/**
 * Generate unique ID for form elements
 */
export const generateId = (prefix: string = 'field'): string => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * ARIA label helpers
 */
export const ariaLabel = {
    // Navigation
    mainNav: 'التنقل الرئيسي',
    userMenu: 'قائمة المستخدم',
    notifications: 'الإشعارات',

    // Actions
    close: 'إغلاق',
    open: 'فتح',
    delete: 'حذف',
    edit: 'تعديل',
    save: 'حفظ',
    cancel: 'إلغاء',
    submit: 'إرسال',
    search: 'بحث',
    filter: 'تصفية',
    sort: 'ترتيب',

    // Status
    loading: 'جاري التحميل',
    error: 'خطأ',
    success: 'نجح',
    warning: 'تحذير',

    // Forms
    required: 'حقل مطلوب',
    optional: 'حقل اختياري',
    invalid: 'قيمة غير صالحة',

    // Media
    playVideo: 'تشغيل الفيديو',
    pauseVideo: 'إيقاف الفيديو',
    muteVideo: 'كتم الصوت',
    unmuteVideo: 'إلغاء كتم الصوت',

    // Pagination
    nextPage: 'الصفحة التالية',
    previousPage: 'الصفحة السابقة',
    firstPage: 'الصفحة الأولى',
    lastPage: 'الصفحة الأخيرة',

    // Course
    enrollCourse: 'التسجيل في الكورس',
    viewCourse: 'عرض الكورس',
    rateCourse: 'تقييم الكورس',

    // Custom
    custom: (label: string) => label,
};

/**
 * ARIA live region announcer
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcer = document.getElementById('aria-live-announcer');
    if (announcer) {
        announcer.setAttribute('aria-live', priority);
        announcer.textContent = message;

        // Clear after announcement
        setTimeout(() => {
            announcer.textContent = '';
        }, 1000);
    }
};

/**
 * Focus trap for modals
 */
export const trapFocus = (element: HTMLElement) => {
    const focusableElements = element.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
            if (document.activeElement === firstFocusable) {
                lastFocusable.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastFocusable) {
                firstFocusable.focus();
                e.preventDefault();
            }
        }
    };

    element.addEventListener('keydown', handleTabKey);

    // Focus first element
    firstFocusable?.focus();

    return () => {
        element.removeEventListener('keydown', handleTabKey);
    };
};

/**
 * Keyboard navigation helpers
 */
export const handleArrowNavigation = (
    e: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    onSelect?: (index: number) => void
) => {
    let newIndex = currentIndex;

    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault();
            newIndex = Math.min(currentIndex + 1, items.length - 1);
            break;
        case 'ArrowUp':
            e.preventDefault();
            newIndex = Math.max(currentIndex - 1, 0);
            break;
        case 'Home':
            e.preventDefault();
            newIndex = 0;
            break;
        case 'End':
            e.preventDefault();
            newIndex = items.length - 1;
            break;
        case 'Enter':
        case ' ':
            e.preventDefault();
            onSelect?.(currentIndex);
            return currentIndex;
    }

    items[newIndex]?.focus();
    return newIndex;
};

/**
 * Skip to main content link
 */
export const SkipToMainContent = () => {
    return (
        <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:shadow-lg"
        >
            تخطي إلى المحتوى الرئيسي
        </a>
    );
};

/**
 * Screen reader only text
 */
export const ScreenReaderOnly = ({ children }: { children: React.ReactNode }) => {
    return <span className="sr-only">{children}</span>;
};

/**
 * Visually hidden but accessible
 */
export const visuallyHidden = {
    position: 'absolute' as const,
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap' as const,
    borderWidth: 0,
};
