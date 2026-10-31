import { useState } from "react";
import { Settings, Building2, Mail, Code2 } from "lucide-react";
import { CompanySettingsForm } from "./CompanySettingsForm";
import { NotificationSettingsForm } from "./NotificationSettingsForm";
import { CustomCodeForm } from "./CustomCodeForm";
import { cn } from "@/admin/lib/utils";

export type SettingsTab = "company" | "notifications" | "custom-code";

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("company");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-7 h-7 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900">
              Cấu hình Hệ thống
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Quản trị thông tin nhận diện doanh nghiệp, hotline, cam kết dịch vụ,
            cấu hình gửi email thông báo đơn đặt xe và mã tùy chỉnh toàn website.
          </p>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex flex-wrap border-b border-slate-200 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab("company")}
          className={cn(
            "flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition cursor-pointer",
            activeTab === "company"
              ? "border-blue-600 text-blue-600 bg-blue-50/60 rounded-t-lg"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300",
          )}
        >
          <Building2 className="w-4 h-4" />
          Thông tin Doanh nghiệp & Thương hiệu
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("notifications")}
          className={cn(
            "flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition cursor-pointer",
            activeTab === "notifications"
              ? "border-blue-600 text-blue-600 bg-blue-50/60 rounded-t-lg"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300",
          )}
        >
          <Mail className="w-4 h-4" />
          Cấu hình Thông báo Email (SMTP)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("custom-code")}
          className={cn(
            "flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition cursor-pointer",
            activeTab === "custom-code"
              ? "border-blue-600 text-blue-600 bg-blue-50/60 rounded-t-lg"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300",
          )}
        >
          <Code2 className="w-4 h-4" />
          Custom Code (Head / Body / Footer)
        </button>
      </div>

      {/* Tab content */}
      <div className="mt-4">
        {activeTab === "company" && <CompanySettingsForm />}
        {activeTab === "notifications" && <NotificationSettingsForm />}
        {activeTab === "custom-code" && <CustomCodeForm />}
      </div>
    </div>
  );
}

export default SettingsPage;
