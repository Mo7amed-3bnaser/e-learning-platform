'use client';

import { useEffect, useState, useRef } from 'react';
import { FiTrash2, FiEdit2, FiSend, FiUser, FiMoreVertical } from 'react-icons/fi';
import { commentsAPI } from '@/lib/api';
import { handleApiError, showToast } from '@/lib/toast';
import { useAuthStore } from '@/store/authStore';

interface Comment {
  _id: string;
  content: string;
  userName: string;
  userAvatar?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface VideoCommentsProps {
  videoId: string;
}

export default function VideoComments({ videoId }: VideoCommentsProps) {
  const { user, isAuthenticated } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchComments();
  }, [videoId]);

  // إغلاق القائمة عند الضغط خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const response = await commentsAPI.getVideoComments(videoId);
      setComments(response.data.data || []);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) {
      showToast('الرجاء كتابة تعليق', 'error');
      return;
    }

    if (!isAuthenticated) {
      showToast('يجب تسجيل الدخول أولاً', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await commentsAPI.addComment({
        videoId,
        content: newComment.trim()
      });

      setComments([response.data.data, ...comments]);
      setNewComment('');
      showToast('تم إضافة التعليق بنجاح', 'success');
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editContent.trim()) {
      showToast('الرجاء كتابة تعليق', 'error');
      return;
    }

    try {
      await commentsAPI.updateComment(commentId, editContent.trim());

      setComments(comments.map(comment =>
        comment._id === commentId
          ? { ...comment, content: editContent.trim() }
          : comment
      ));

      setEditingCommentId(null);
      setEditContent('');
      showToast('تم تعديل التعليق بنجاح', 'success');
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا التعليق؟')) {
      return;
    }

    try {
      await commentsAPI.deleteComment(commentId);
      setComments(comments.filter(comment => comment._id !== commentId));
      showToast('تم حذف التعليق بنجاح', 'success');
    } catch (error) {
      handleApiError(error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return minutes === 0 ? 'الآن' : `منذ ${minutes} دقيقة`;
      }
      return `منذ ${hours} ساعة`;
    } else if (days === 1) {
      return 'أمس';
    } else if (days < 7) {
      return `منذ ${days} يوم`;
    } else {
      return date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  return (
    <div className="bg-slate-800 rounded-2xl p-6 mt-6">
      <h2 className="text-xl font-bold text-white mb-4">
        التعليقات ({comments.length})
      </h2>

      {/* نموذج إضافة تعليق */}
      {isAuthenticated && (
        <form onSubmit={handleAddComment} className="mb-6">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <FiUser className="w-5 h-5 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="أضف تعليقك..."
                className="w-full bg-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                rows={3}
                disabled={isSubmitting}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !newComment.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FiSend className="w-4 h-4" />
                  <span>{isSubmitting ? 'جاري الإرسال...' : 'إرسال'}</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* قائمة التعليقات */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-slate-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-700 rounded w-1/4"></div>
                  <div className="h-16 bg-slate-700 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-slate-400">لا توجد تعليقات بعد. كن أول من يعلق!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => {
            // تحقق من صاحب التعليق
            // userId قد يكون string أو object (بعد populate)
            const commentUserId = typeof comment.userId === 'string'
              ? comment.userId
              : (comment.userId as any)?._id;

            // استخدام id من الـ store (الـ backend بيرجع id مش _id)
            const currentUserId = user?.id;
            const isOwner = isAuthenticated && currentUserId && commentUserId === currentUserId;

            return (
              <div key={comment._id} className="flex gap-3 p-4 bg-slate-700/50 rounded-xl">
                <div className="flex-shrink-0">
                  {comment.userAvatar ? (
                    <img
                      src={comment.userAvatar}
                      alt={comment.userName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                      <FiUser className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <p className="font-medium text-white">{comment.userName}</p>
                    <p className="text-xs text-slate-400">{formatDate(comment.createdAt)}</p>
                  </div>

                  {/* قائمة التعديل والحذف - تظهر فقط لصاحب التعليق */}
                  {isOwner && (
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === comment._id ? null : comment._id);
                        }}
                        className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-600"
                      >
                        <FiMoreVertical className="w-5 h-5" />
                      </button>

                      {/* Dropdown Menu */}
                      {openMenuId === comment._id && (
                        <>
                          {/* Backdrop */}
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setOpenMenuId(null)}
                          />

                          <div
                            ref={menuRef}
                            className="absolute left-0 top-full mt-1 bg-slate-700 rounded-lg shadow-xl py-2 min-w-[140px] z-50 border border-slate-600"
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingCommentId(comment._id);
                                setEditContent(comment.content);
                                setOpenMenuId(null);
                              }}
                              className="flex items-center gap-3 w-full px-4 py-2 text-slate-200 hover:bg-slate-600 transition-colors text-right"
                            >
                              <FiEdit2 className="w-4 h-4" />
                              <span className="text-sm">تعديل</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteComment(comment._id);
                                setOpenMenuId(null);
                              }}
                              className="flex items-center gap-3 w-full px-4 py-2 text-red-400 hover:bg-slate-600 transition-colors text-right"
                            >
                              <FiTrash2 className="w-4 h-4" />
                              <span className="text-sm">حذف</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {editingCommentId === comment._id ? (
                  <div className="mt-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full bg-slate-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      rows={3}
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        onClick={() => {
                          setEditingCommentId(null);
                          setEditContent('');
                        }}
                        className="px-3 py-1 text-sm text-slate-400 hover:text-white transition-colors"
                      >
                        إلغاء
                      </button>
                      <button
                        onClick={() => handleUpdateComment(comment._id)}
                        className="px-3 py-1 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                      >
                        حفظ
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-200 whitespace-pre-wrap">{comment.content}</p>
                )}
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
