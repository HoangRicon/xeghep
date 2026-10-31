import type { GlobalConfig } from "payload";
import { adminWrite, isAdmin } from "../collections/shared/access";

/**
 * Mã tùy chỉnh toàn site (WPCode-style). Chỉ admin được đọc/ghi, website lấy
 * dữ liệu qua Local API (overrideAccess) để không lộ snippet qua API công khai.
 */
export const CustomCode: GlobalConfig = {
  slug: "custom_code",
  label: "Custom Code (Head / Body / Footer)",
  access: {
    read: isAdmin,
    update: adminWrite,
  },
  admin: {
    description:
      "Chèn thẻ script/meta/CSS tùy chỉnh vào website. Chỉ dán mã từ nguồn tin cậy — mã chạy trực tiếp trên mọi trang công khai.",
  },
  fields: [
    {
      name: "headCode",
      type: "textarea",
      label: "Head code",
      admin: {
        description:
          "Chèn vào <head> trước khi trang render (analytics, meta xác minh, CSS toàn site).",
        placeholder: '<meta name="..." content="..." />',
        rows: 10,
      },
    },
    {
      name: "bodyStartCode",
      type: "textarea",
      label: "Body start code",
      admin: {
        description:
          "Chèn ngay sau thẻ <body> mở (Google Tag Manager noscript, chat widget, script cần chạy sớm).",
        placeholder: "<!-- Mã chèn ngay sau <body> -->",
        rows: 10,
      },
    },
    {
      name: "bodyEndCode",
      type: "textarea",
      label: "Footer / Body end code",
      admin: {
        description:
          "Chèn trước thẻ </body> (pixel, script chạy cuối trang, mã theo dõi chuyển đổi).",
        placeholder: "<!-- Mã chèn trước </body> -->",
        rows: 10,
      },
    },
  ],
};
