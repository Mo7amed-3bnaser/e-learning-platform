"use client";

import { useState, useRef } from 'react';
import { FiCamera, FiUpload, FiLoader } from 'react-icons/fi';
import { uploadAPI, authAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { showSuccess, showError, handleApiError } from '@/lib/toast';

interface AvatarUploadProps {
  currentAvatar?: string | null;
  userName: string;
  onAvatarUpdate?: (newAvatarUrl: string) => void;
}

export default function AvatarUpload({ currentAvatar, userName, onAvatarUpdate }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatar || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateUser = useAuthStore((state) => state.updateUser);
  const user = useAuthStore((state) => state.user);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      showError('يرجى اختيار صورة صحيحة');
      return;
    }

    // التحقق من حجم الملف (أقل من 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
      return;
    }

    try {
      setIsUploading(true);

      // عرض معاينة مباشرة
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      // رفع وتحديث الصورة مباشرة - خطوة واحدة
      const response = await authAPI.updateAvatar(file);
      const avatarUrl = response.data.data.avatar;

      // تحديث الـ Store
      if (user) {
        updateUser({
          ...user,
          avatar: avatarUrl,
        });
      }

      setPreviewUrl(avatarUrl);
      showSuccess('تم تحديث الصورة الشخصية بنجاح! ');

      // استدعاء callback لو موجود
      if (onAvatarUpdate) {
        onAvatarUpdate(avatarUrl);
      }
    } catch (error) {
      handleApiError(error);
      // إرجاع المعاينة للصورة القديمة
      setPreviewUrl(currentAvatar || null);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative group">
      {/* Avatar Display */}
      <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-primary to-primary-dark shadow-lg">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={userName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold uppercase">
            {userName?.charAt(0) || 'U'}
          </div>
        )}
        
        {/* Upload Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
          {isUploading ? (
            <FiLoader className="w-6 h-6 text-white animate-spin" />
          ) : (
            <button
              onClick={triggerFileInput}
              disabled={isUploading}
              className="flex flex-col items-center text-white"
            >
              <FiCamera className="w-6 h-6 mb-1" />
              <span className="text-xs">تغيير</span>
            </button>
          )}
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      {/* Upload Button (Mobile) */}
      <button
        onClick={triggerFileInput}
        disabled={isUploading}
        className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary hover:bg-primary-dark rounded-full shadow-lg flex items-center justify-center text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUploading ? (
          <FiLoader className="w-5 h-5 animate-spin" />
        ) : (
          <FiUpload className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}
