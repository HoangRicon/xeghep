import { useState, useEffect, useCallback, type FormEvent } from "react";
import {
  Code2,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  Braces,
} from "lucide-react";
import { Button } from "@/admin/components/ui/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/admin/components/ui/Card";
import { apiClient, getApiErrorMessage } from "@/admin/lib/api-client";
import type { CustomCodeSettings } from "@/admin/types/settings";

type CodeEditorProps = {
  id: string;
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
};

function CodeEditor({ id, label, hint, value, onChange, placeholder }: CodeEditorProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor={id} className="text-xs font-bold uppercase tracking-wider text-slate-700">
          {label}
        </label>
        <span className="text-[11px] text-slate-400">{value.length} ký tự</span>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">{hint}</p>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={10}
        spellCheck={false}
        className="w-full rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-[12px] leading-relaxed text-emerald-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
      />
    </div>
  );
}

export function CustomCodeForm() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [headCode, setHeadCode] = useState("");
  const [bodyStartCode, setBodyStartCode] = useState("");
  const [bodyEndCode, setBodyEndCode] = useState("");

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const res = await apiClient.get<CustomCodeSettings>("/globals/custom_code");
      if (res.data) {
        setHeadCode(res.data.headCode || "");
        setBodyStartCode(res.data.bodyStartCode || "");
        setBodyEndCode(res.data.bodyEndCode || "");
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: `Không thể nạp Custom Code: ${getApiErrorMessage(err)}`,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      await apiClient.post("/globals/custom_code", {
        headCode,
        bodyStartCode,
        bodyEndCode,
      });
      setMessage({
        type: "success",
        text: "Đã lưu Custom Code. Thay đổi sẽ áp dụng cho các lượt tải trang tiếp theo.",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: `Lỗi khi lưu Custom Code: ${getApiErrorMessage(err)}`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mr-3 text-blue-600" />
        <span>Đang nạp Custom Code...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-xl flex items-start gap-3 border ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          )}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-blue-600" />
            <CardTitle>Custom Code — Head / Body / Footer</CardTitle>
          </div>
          <CardDescription>
            Chèn script, meta tag, CSS hoặc HTML tùy chỉnh vào toàn bộ website
            công khai mà không cần sửa source. Để trống ô nào thì khu vực đó
            không chèn gì.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs leading-relaxed">
              <p className="font-bold text-sm">Chỉ dán mã từ nguồn bạn tin cậy</p>
              <p>
                Mã được chèn nguyên văn vào trang và chạy với quyền của website.
                Không dán mã lạ, mã đã bị chỉnh sửa hoặc script do người khác gửi
                mà không kiểm tra. Custom Code không áp dụng cho trang quản trị.
              </p>
            </div>
          </div>

          <CodeEditor
            id="custom-code-head"
            label="1. Head — chèn trong <head>"
            hint="Dán mã HTML gốc từ Google Tag Manager, Google Analytics hoặc mã xác minh. Giữ nguyên cặp thẻ <script>...</script>; không dán mã React/JSX."
            value={headCode}
            onChange={setHeadCode}
            placeholder={'<meta name="google-site-verification" content="..." />\n<script>/* ... */</script>'}
          />

          <CodeEditor
            id="custom-code-body-start"
            label="2. Body start — ngay sau <body>"
            hint="Dùng cho Google Tag Manager (noscript), chat widget hoặc script cần chạy sớm trước nội dung trang."
            value={bodyStartCode}
            onChange={setBodyStartCode}
            placeholder={'<!-- Mã chèn ngay sau thẻ <body> mở -->\n<noscript>...</noscript>'}
          />

          <CodeEditor
            id="custom-code-body-end"
            label="3. Footer — trước </body>"
            hint="Dùng cho Facebook Pixel, TikTok Pixel, mã theo dõi chuyển đổi hoặc script chạy cuối trang."
            value={bodyEndCode}
            onChange={setBodyEndCode}
            placeholder={'<!-- Mã chèn trước thẻ </body> -->\n<script>/* ... */</script>'}
          />

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Braces className="w-4 h-4 text-slate-400" />
            <span>
              Mã được chèn dạng thô (raw). Nếu dán cả cặp thẻ{" "}
              <code className="px-1 py-0.5 rounded bg-slate-100 text-slate-700">
                &lt;script&gt;...&lt;/script&gt;
              </code>{" "}
              thì giữ nguyên, không cần bỏ thẻ.
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSaving}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>Lưu Custom Code</span>
        </Button>
      </div>
    </form>
  );
}
