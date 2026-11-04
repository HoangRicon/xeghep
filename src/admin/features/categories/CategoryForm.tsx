import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/admin/components/ui/Button";
import { Input } from "@/admin/components/ui/Input";
import { Textarea } from "@/admin/components/ui/Textarea";
import { Card } from "@/admin/components/ui/Card";
import { apiClient, getApiErrorMessage } from "@/admin/lib/api-client";
import { slugify } from "@/admin/lib/utils";
import type { ArticleCategoryDoc } from "./CategoryList";

interface FormState {
  name: string;
  slug: string;
  description: string;
}

const initialFormState: FormState = {
  name: "",
  slug: "",
  description: "",
};

export function CategoryForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id && id !== "new");

  const [form, setForm] = useState<FormState>(initialFormState);
  const [isLoadingDoc, setIsLoadingDoc] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  const fetchCategory = useCallback(async () => {
    if (!id || id === "new") return;
    try {
      setIsLoadingDoc(true);
      setApiError(null);
      const res = await apiClient.get<ArticleCategoryDoc>(`/article-categories/${id}`);
      const doc = res.data;
      setForm({
        name: doc.name || "",
        slug: doc.slug || "",
        description: doc.description || "",
      });
      setIsSlugManuallyEdited(true);
    } catch (err) {
      setApiError(getApiErrorMessage(err));
    } finally {
      setIsLoadingDoc(false);
    }
  }, [id]);

  useEffect(() => {
    if (isEdit) {
      fetchCategory();
    }
  }, [isEdit, fetchCategory]);

  const handleNameChange = (val: string) => {
    setForm((prev) => ({
      ...prev,
      name: val,
      slug: isSlugManuallyEdited ? prev.slug : slugify(val),
    }));
  };

  const handleSlugChange = (val: string) => {
    setIsSlugManuallyEdited(true);
    setForm((prev) => ({ ...prev, slug: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!form.name.trim()) {
      setApiError("Vui lòng nhập tên danh mục.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || slugify(form.name.trim()),
        description: form.description.trim() || null,
      };

      if (isEdit) {
        await apiClient.patch(`/article-categories/${id}`, payload);
      } else {
        await apiClient.post("/article-categories", payload);
      }

      navigate("/categories");
    } catch (err) {
      setApiError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingDoc) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm font-medium">Đang nạp dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-16">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 pb-4 -mx-6 px-6 pt-6 sm:-mx-8 sm:px-8 sm:pt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              to="/categories"
              className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium mb-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại danh sách</span>
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {isEdit ? "Chỉnh sửa danh mục" : "Tạo danh mục mới"}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEdit
                ? `Cập nhật thông tin danh mục #${id}`
                : "Thêm danh mục mới cho bài viết."}
            </p>
          </div>
          <Button
            type="submit"
            form="category-form"
            disabled={isSubmitting}
            className="cursor-pointer shadow-sm"
          >
            <Save className="w-3.5 h-3.5 mr-1.5" />
            <span>{isSubmitting ? "Đang lưu..." : "Lưu danh mục"}</span>
          </Button>
        </div>
      </div>

      {/* Error */}
      {apiError && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Form */}
      <form id="category-form" onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <div className="space-y-4">
            <Input
              label="Tên danh mục"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              placeholder="Ví dụ: Kinh nghiệm đi xe"
              maxLength={100}
            />
            <Input
              label="Slug"
              value={form.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              required
              placeholder="kinh-nghiem-di-xe"
              helperText="Tự sinh từ tên khi để trống. Dùng cho URL."
            />
            <Textarea
              label="Mô tả"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Mô tả ngắn về danh mục (optional)"
              maxLength={500}
              rows={3}
            />
          </div>
        </Card>
      </form>
    </div>
  );
}
