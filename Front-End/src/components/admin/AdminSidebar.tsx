'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
    FiHome,
    FiBook,
    FiShoppingCart,
    FiUsers,
    FiLogOut,
    FiX,
    FiChevronLeft,
    FiUserCheck,
    FiTag
} from 'react-icons/fi';

interface AdminSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const navItems = [
    { href: '/admin', label: 'الرئيسية', icon: FiHome, exact: true },
    { href: '/admin/courses', label: 'الكورسات', icon: FiBook },
    { href: '/admin/orders', label: 'الطلبات', icon: FiShoppingCart },
    { href: '/admin/students', label: 'الطلاب', icon: FiUsers },
    { href: '/admin/coupons', label: 'الكوبونات', icon: FiTag },
    { href: '/admin/instructor-applications', label: 'طلبات المدرسين', icon: FiUserCheck },
];

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
    const pathname = usePathname();
    const { user, logout } = useAuthStore();

    const isActive = (href: string, exact?: boolean) => {
        if (exact) return pathname === href;
        return pathname.startsWith(href);
    };

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    return (
        <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
            {/* Close button (mobile) */}
            <button className="admin-sidebar-close" onClick={onClose}>
                <FiX size={24} />
            </button>

            {/* Logo */}
            <div className="admin-sidebar-logo">
                <div className="admin-logo-icon">M</div>
                <div className="admin-logo-text">
                    <h2>مسار</h2>
                    <span>لوحة التحكم</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="admin-sidebar-nav">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href, item.exact);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`admin-nav-item ${active ? 'active' : ''}`}
                            onClick={onClose}
                        >
                            <Icon size={20} />
                            <span>{item.label}</span>
                            {active && <FiChevronLeft size={16} className="admin-nav-arrow" />}
                        </Link>
                    );
                })}
            </nav>

            {/* Back to site */}
            <div className="admin-sidebar-divider" />
            <Link href="/" className="admin-nav-item admin-back-link" onClick={onClose}>
                <FiChevronLeft size={20} />
                <span>العودة للموقع</span>
            </Link>

            {/* User info + Logout */}
            <div className="admin-sidebar-footer">
                <div className="admin-user-info">
                    <div className="admin-user-avatar" style={{ position: 'relative', overflow: 'hidden' }}>
                        {user?.avatar ? (
                            <Image src={user.avatar} alt={user.name || ''} fill sizes="40px" style={{ objectFit: 'cover' }} />
                        ) : (
                            <span>{user?.name?.charAt(0).toUpperCase()}</span>
                        )}
                    </div>
                    <div className="admin-user-details">
                        <p className="admin-user-name">{user?.name}</p>
                        <p className="admin-user-role">مدير</p>
                    </div>
                </div>
                <button className="admin-logout-btn" onClick={handleLogout}>
                    <FiLogOut size={18} />
                    <span>تسجيل الخروج</span>
                </button>
            </div>
        </aside>
    );
}
