import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { constructMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { ARTICLES as FALLBACK_ARTICLES, type Article } from "@/data/articles";
import { getArticle, getArticles, getCompanySettings, isNotFoundError, type ArticleDetail } from "@/lib/api";
import { COMPANY_INFO } from "@/data/company-info";
import { buildArticleSchema } from "@/lib/schema";
import {
  Calendar,
  User,
  PhoneCall,
  List,
  ArrowRight,
  Car,
} from "lucide-react";

export const revalidate = 60;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  try {
    const res = await getArticles();
    if (res.items && res.items.length > 0) {
      return res.items.map((article) => ({ slug: article.slug }));
    }
  } catch {
    // CMS offline fallback
  }
  return FALLBACK_ARTICLES.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let article: ArticleDetail | (typeof FALLBACK_ARTICLES)[number] | undefined;

  try {
    article = await getArticle(slug);
  } catch (error) {
    if (isNotFoundError(error)) {
      article = FALLBACK_ARTICLES.find((a) => a.slug === slug);
    } else {
      article = FALLBACK_ARTICLES.find((a) => a.slug === slug);
    }
  }

  if (!article) return {};

  return constructMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/tin-tuc/${article.slug}`,
    type: "article",
    publishedTime: article.publishedAt,
    modifiedTime: article.updatedAt,
    author: article.author,
    image: article.image,
  });
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  let article: ArticleDetail | (typeof FALLBACK_ARTICLES)[number] | undefined;

  try {
    article = await getArticle(slug);
  } catch (error) {
    if (isNotFoundError(error)) {
      article = FALLBACK_ARTICLES.find((a) => a.slug === slug);
      if (!article) notFound();
    } else {
      article = FALLBACK_ARTICLES.find((a) => a.slug === slug);
      if (!article) notFound();
    }
  }

  if (!article) {
    notFound();
  }

  const companySettings = await getCompanySettings();
  const info = companySettings.info ?? COMPANY_INFO;
  const siteDomain = info.website || undefined;

  const breadcrumbs = [
    { name: "Trang chủ", path: "/" },
    { name: "Tin tức", path: "/tin-tuc" },
    { name: article.title, path: `/tin-tuc/${article.slug}` },
  ];

  const articleSchema = buildArticleSchema({
    title: article.title,
    description: article.excerpt,
    path: `/tin-tuc/${article.slug}`,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    authorName: article.author,
    imageUrl: article.image,
    siteDomain,
  });

  let otherArticles: Article[] = [];
  try {
    const listRes = await getArticles({ limit: 4, excludeSlug: article.slug });
    if (listRes.items && listRes.items.length > 0) {
      otherArticles = listRes.items.slice(0, 3);
    }
  } catch {
    // CMS offline fallback
  }

  if (otherArticles.length === 0) {
    otherArticles = (FALLBACK_ARTICLES as Article[])
      .filter((a) => a.slug !== article.slug)
      .slice(0, 3);
  }

  return (
    <>
      <JsonLd data={articleSchema} />
      <Breadcrumbs items={breadcrumbs} siteDomain={siteDomain} />

      <div className="bg-white">
        <article className="mx-auto max-w-3xl px-4 pb-24 pt-8 sm:px-6 sm:pb-20 sm:pt-10 lg:px-8">
          <header className="space-y-4 border-b border-slate-200 pb-6">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-slate-500">
              <span className="inline-block rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-red-700">
                {article.categoryName}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-red-600" aria-hidden="true" />
                <time dateTime={article.publishedAt}>
                  {new Date(article.publishedAt).toLocaleDateString("vi-VN")}
                </time>
              </span>
            </div>

            <h1 className="text-2xl font-black leading-tight tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <User className="h-4 w-4 text-red-600" aria-hidden="true" />
                <span>{article.author}</span>
              </span>
            </div>
          </header>

          {article.image && (
            <figure className="mt-6 overflow-hidden rounded-xl bg-slate-100">
              <div className="relative aspect-[16/9] w-full">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="object-cover"
                />
              </div>
              <figcaption className="border-t border-slate-100 bg-slate-50 p-2.5 text-center text-xs italic text-slate-500">
                {article.title}
              </figcaption>
            </figure>
          )}

          <div className="mt-6 flex flex-col gap-3 rounded-xl border border-red-100 bg-red-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Car className="h-8 w-8 shrink-0 text-red-600" aria-hidden="true" />
              <div>
                <p className="text-xs font-extrabold text-slate-900 sm:text-sm">
                  Cần đặt xe ghép liên tỉnh đón tận nhà?
                </p>
                <p className="text-[11px] text-slate-600">
                  Xe 4–7 chỗ đời mới, chỉ 1–3 khách/chuyến, chạy cao tốc liên tục.
                </p>
              </div>
            </div>
            <a
              href={info.hotlineHref}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
            >
              <PhoneCall className="h-3.5 w-3.5 animate-pulse pointer-events-none" aria-hidden="true" />
              <span>Gọi: {info.hotline}</span>
            </a>
          </div>

          {article.tableOfContents.length > 0 && (
            <nav
              aria-label="Mục lục bài viết"
              className="mt-8 border-l-2 border-red-500 pl-4"
            >
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <List className="h-4 w-4 text-red-600" aria-hidden="true" />
                <span>Mục lục bài viết</span>
              </h2>
              <ol className="mt-2 space-y-1.5 text-sm text-slate-700">
                {article.tableOfContents.map((toc) => (
                  <li key={toc.id}>
                    <a
                      href={`#${toc.id}`}
                      className="hover:text-red-700 hover:underline"
                    >
                      {toc.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {"customCss" in article && article.customCss && (
            <style>{article.customCss}</style>
          )}
          <div
            data-article-content
            className="article-content mt-8"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          <div className="mt-12 flex flex-col items-center justify-between gap-6 rounded-xl bg-slate-900 p-6 text-white sm:flex-row sm:p-8">
            <div className="space-y-1 text-center sm:text-left">
              <h2 className="text-lg font-black uppercase sm:text-xl">
                Đặt xe ghép nhanh chóng 24/7
              </h2>
              <p className="text-xs text-slate-300">
                Đón trả tận nhà, cam kết 100% hoàn tiền nếu không hài lòng chất lượng.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/tuyen-lien-tinh"
                className="rounded-xl bg-white px-5 py-3 text-xs font-extrabold text-red-700 hover:bg-red-50 sm:text-sm"
              >
                <span>Xem các tuyến</span>
              </Link>
              <a
                href={info.hotlineHref}
                className="flex items-center gap-1.5 rounded-xl bg-red-600 px-5 py-3 text-xs font-extrabold text-white hover:bg-red-700 sm:text-sm"
              >
                <PhoneCall className="h-4 w-4 pointer-events-none" aria-hidden="true" />
                <span>Gọi {info.hotline}</span>
              </a>
            </div>
          </div>
        </article>

        {otherArticles.length > 0 && (
          <section className="border-t border-slate-200 bg-slate-50">
            <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
              <h2 className="text-xl font-black uppercase text-slate-900">
                Bài viết liên quan
              </h2>
              <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-3">
                {otherArticles.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/tin-tuc/${item.slug}`}
                    className="group block"
                  >
                    {item.image && (
                      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-slate-200">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="(max-width: 640px) 100vw, 320px"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="mt-3">
                      <span className="text-[11px] font-bold uppercase tracking-wide text-red-600">
                        {item.categoryName}
                      </span>
                      <h3 className="mt-1 text-sm font-bold leading-snug text-slate-900 transition-colors group-hover:text-red-700">
                        {item.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                        {item.excerpt}
                      </p>
                      <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-red-600">
                        Đọc bài viết
                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
