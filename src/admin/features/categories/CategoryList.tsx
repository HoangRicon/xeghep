import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  RefreshCw,
  FileText,
} from "lucide-react";
import { Button } from "@/admin/components/ui/Button";
import { Input } from "@/admin/components/ui/Input";
import { DataTable, type Column } from "@/admin/components/common/DataTable";
import { ConfirmDialog } from "@/admin/components/common/ConfirmDialog";
import { apiClient, getApiErrorMessage } from "@/admin/lib/api-client";
import type { PaginatedResponse } from "@/admin/types/api";

export interface ArticleCategoryDoc {
  id: string;
  name: string;
  slug: string;
  description?: string;
  articleCount?: number;
  updatedAt: string;
}

export function CategoryList() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<ArticleCategoryDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<ArticleCategoryDoc | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await apiClient.get<PaginatedResponse<ArticleCategoryDoc>>(
        "/article-categories",
        { params: { limit: 100, sort: "name" } }
      );
      const data = res.data;
      if (data && Array.isArray(data.docs)) {
        setCategories(data.docs);
      } else {
        setCategories([]);
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    try {
      setIsDeleting(true);
      await apiClient.delete(`/article-categories/${categoryToDelete.id}`);
      setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
      setCategoryToDelete(null);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<ArticleCategoryDoc>[] = [
    {
      key: "name",
      header: "Tên danh mục",
      render: (cat) => (
        <div>
          <div className="font-semibold text-slate-900">{cat.name}</div>
          {cat.description && (
            <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">{cat.description}</div>
          )}
        </div>
      ),
    },
    {
      key: "slug",
      header: "Slug",
      render: (cat) => (
        <code className="text-xs bg-slate-100 px-2 py-0.5 rounded">{cat.slug}</code>
      ),
    },
    {
      key: "articleCount",
      header: "Số bài",
      render: (cat) => (
        <span className="inline-flex items-center gap-1 text-sm font-medium text-slate-700">
          <FileText className="w-3.5 h-3.5" />
          {cat.articleCount ?? 0}
        </span>
      ),
    },
    {
      key: "updatedAt",
      header: "Cập nhật",
      render: (cat) => (
        <span className="text-xs text-slate-500">
          {new Date(cat.updatedAt).toLocaleDateString("vi-VN")}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (cat) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => navigate(`/categories/${cat.id}`)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
            aria-label={`Chỉnh sửa ${cat.name}`}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setCategoryToDelete(cat)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
            aria-label={`Xóa ${cat.name}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Danh mục bài viết
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý danh mục cho bài viết tin tức và cẩm nang.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => navigate("/categories/new")}
          className="cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Tạo danh mục mới</span>
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      <DataTable
        columns={columns}
        data={categories}
        isLoading={isLoading}
        emptyMessage="Chưa có danh mục nào. Nhấn 'Tạo danh mục mới' để bắt đầu."
      />

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={categoryToDelete !== null}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Xóa danh mục"
        description={`Bạn có chắc muốn xóa danh mục "${categoryToDelete?.name}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa vĩnh viễn"
        variant="destructive"
      />
    </div>
  );
}
