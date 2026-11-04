import type { CollectionConfig } from "payload";
import { slugify } from "../../lib/seo/slugify";
import { isAdminOrEditor, openRead } from "../shared/access";

export const ArticleCategories: CollectionConfig = {
  slug: "article-categories",
  access: {
    create: ({ req }) => isAdminOrEditor({ req }),
    delete: ({ req }) => isAdminOrEditor({ req }),
    read: openRead,
    update: ({ req }) => isAdminOrEditor({ req }),
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "slug", "articleCount", "updatedAt"],
    description: "Danh mục bài viết - quản lý linh hoạt từ admin.",
  },
  hooks: {
    beforeValidate: [
      ({ data, originalDoc }: any) => {
        if (!data) return data;

        // slug: tự sinh từ name khi để trống
        const name = data.name ?? originalDoc?.name;
        if (name && (!data.slug || typeof data.slug !== "string")) {
          const generated = slugify(String(name));
          if (generated) data.slug = generated;
        }

        return data;
      },
    ],
  },
  fields: [
    {
      name: "name",
      type: "text",
      label: "Tên danh mục",
      required: true,
      unique: true,
      maxLength: 100,
      admin: {
        description: "Ví dụ: Kinh nghiệm đi xe, Tin tuyến & Báo giá, Khuyến mãi",
      },
    },
    {
      name: "slug",
      type: "text",
      label: "Slug",
      required: true,
      unique: true,
      index: true,
      admin: {
        description: "Tự sinh từ tên danh mục khi để trống. Dùng cho URL.",
      },
    },
    {
      name: "description",
      type: "textarea",
      label: "Mô tả",
      maxLength: 500,
      admin: {
        description: "Mô tả ngắn về danh mục (optional).",
      },
    },
    {
      name: "articleCount",
      type: "number",
      label: "Số bài viết",
      admin: {
        readOnly: true,
        description: "Tự động đếm số bài viết trong danh mục này.",
      },
    },
  ],
};
