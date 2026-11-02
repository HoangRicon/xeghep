import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound, permanentRedirect } from "next/navigation";
import { constructMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { ARTICLES as FALLBACK_ARTICLES } from "@/data/articles";
import { getArticles, getRoutes, getCompanySettings } from "@/lib/api";
import { COMPANY_INFO } from "@/data/company-info";
import { Calendar, User, ArrowRight, PhoneCall, MapPin } from "lucide-react";

export const revalidate = 60;

const PAGE_SIZE = 12;
const NEWS_DESCRIPTION =
  "Cập nhật tin tức, cẩm nang và kinh nghiệm đi xe ghép liên tỉnh Móng Cái, Hạ Long, Hải Phòng, Hà Nội, Bắc Ninh, Bắc Giang đón trả tận nơi.";

type Props = {
  searchParams: Promise<{ page?: string | string[] }>;
};

function parsePage(value: string | string[] | undefined): number | null {
  if (value === undefined) return 1;
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) return null;
  const page = Number(value);
  return Number.isSafeInteger(page) ? page : null;
}

function pageHref(page: number): string {
  return page === 1 ? "/tin-tuc" : `/tin-tuc?page=${page}`;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("vi-VN");
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { page: rawPage } = await searchParams;
  const page = parsePage(rawPage);
  if (page === null) notFound();

  return constructMetadata({
    title: page === 1
      ? "Tin Tức & Cẩm Nang Xe Ghép Liên Tỉnh 2026"
      : `Tin Tức & Cẩm Nang Xe Ghép - Trang ${page}`,
    description: page === 1 ? NEWS_DESCRIPTION : `${NEWS_DESCRIPTION} Trang ${page}.`,
    path: pageHref(page),
  });
}

export default async function NewsIndexPage({ searchParams }: Props) {
  const { page: rawPage } = await searchParams;
  const page = parsePage(rawPage);
  if (page === null) notFound();
  if (rawPage !== undefined && rawPage !== String(page)) permanentRedirect(pageHref(page));

  const [routes, articlesRes, companySettings] = await Promise.all([
    getRoutes().catch(() => []),
    getArticles({ page, limit: PAGE_SIZE }).catch(() => null),
    getCompanySettings(),
  ]);
  const info = companySettings.info ?? COMPANY_INFO;

  const articles = articlesRes?.items ?? FALLBACK_ARTICLES;
  const totalPages = Math.max(1, articlesRes?.meta.totalPages ?? 1);
  if (page > totalPages || (page > 1 && articles.length === 0)) notFound();

  const visiblePages = [...new Set([1, page - 1, page, page + 1, totalPages])]
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((a, b) => a - b);

  const breadcrumbs = [
    { name: "Trang chủ", path: "/" },
    { name: "Tin tức", path: "/tin-tuc" },
  ];

  const featuredArticle = page === 1 ? articles[0] : null;
  const otherArticles = page === 1 ? articles.slice(1) : articles;

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />

      <div className="bg-white pb-24">
        <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-10 lg:px-8">
          <header className="border-b border-slate-200 pb-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-red-600">
              Bản tin &amp; cẩm nang
            </p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
              Tin tức
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              Kinh nghiệm đặt xe, bảng giá liên tỉnh mới nhất và thông tin hữu ích
              cho chuyến đi của quý khách.
            </p>
          </header>

          {featuredArticle && (
            <section aria-labelledby="featured-heading" className="border-b border-slate-200 py-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Bài nổi bật
              </p>
              <Link
                href={`/tin-tuc/${featuredArticle.slug}`}
                className="group mt-4 grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-center"
              >
                {featuredArticle.image && (
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-slate-100">
                    <Image
                      src={featuredArticle.image}
                      alt={featuredArticle.title}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 620px"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                )}
                <div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                    <span className="font-bold uppercase tracking-wide text-red-600">
                      {featuredArticle.categoryName}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-red-600" aria-hidden="true" />
                      <time dateTime={featuredArticle.publishedAt}>
                        {formatDate(featuredArticle.publishedAt)}
                      </time>
                    </span>
                  </div>

                  <h2
                    id="featured-heading"
                    className="mt-2 text-xl font-black leading-tight text-slate-900 transition-colors group-hover:text-red-700 sm:text-2xl"
                  >
                    {featuredArticle.title}
                  </h2>

                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">
                    {featuredArticle.excerpt}
                  </p>

                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <User className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{featuredArticle.author}</span>
                    </span>
                    <span className="flex items-center gap-1 font-bold text-red-600">
                      Đọc bài viết
                      <ArrowRight
                        className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </span>
                  </div>
                </div>
              </Link>
            </section>
          )}

          <section aria-labelledby="news-list-heading" className="pt-8">
            <div className="flex items-end justify-between gap-4 border-b border-slate-200 pb-3">
              <h2
                id="news-list-heading"
                className="text-lg font-black uppercase tracking-tight text-slate-900"
              >
                {page === 1 ? "Cẩm nang & bài viết mới nhất" : `Tin tức - Trang ${page}`}
              </h2>
              <span className="shrink-0 text-xs text-slate-500">
                {articles.length} bài viết
              </span>
            </div>

            <div className="divide-y divide-slate-200">
              {otherArticles.map((article) => (
                <article key={article.slug}>
                  <Link
                    href={`/tin-tuc/${article.slug}`}
                    className="group grid gap-4 py-6 sm:grid-cols-[1fr_200px] sm:items-start sm:gap-8"
                  >
                    <div className="order-2 sm:order-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span className="font-bold uppercase tracking-wide text-red-600">
                          {article.categoryName}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                          <time dateTime={article.publishedAt}>
                            {formatDate(article.publishedAt)}
                          </time>
                        </span>
                      </div>

                      <h3 className="mt-2 text-base font-bold leading-snug text-slate-900 transition-colors group-hover:text-red-700 sm:text-lg">
                        {article.title}
                      </h3>

                      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-600">
                        {article.excerpt}
                      </p>

                      <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>{article.author}</span>
                        </span>
                        <span className="flex items-center gap-1 font-bold text-red-600">
                          Đọc tiếp
                          <ArrowRight
                            className="h-3 w-3 transition-transform group-hover:translate-x-1"
                            aria-hidden="true"
                          />
                        </span>
                      </div>
                    </div>

                    {article.image && (
                      <div className="relative order-1 aspect-[16/10] w-full overflow-hidden rounded-lg bg-slate-100 sm:order-2">
                        <Image
                          src={article.image}
                          alt={article.title}
                          fill
                          sizes="(max-width: 640px) 100vw, 200px"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      </div>
                    )}
                  </Link>
                </article>
              ))}
            </div>

            {totalPages > 1 && (
              <nav
                aria-label="Phân trang tin tức"
                className="flex flex-wrap items-center justify-center gap-2 pt-8"
              >
                {page > 1 && (
                  <Link
                    href={pageHref(page - 1)}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-red-300 hover:text-red-700"
                  >
                    Trang trước
                  </Link>
                )}
                {visiblePages.map((visiblePage, index) => (
                  <div key={visiblePage} className="flex items-center gap-2">
                    {index > 0 && visiblePage - visiblePages[index - 1] > 1 && (
                      <span aria-hidden="true" className="px-1 text-slate-500">
                        …
                      </span>
                    )}
                    <Link
                      href={pageHref(visiblePage)}
                      aria-label={`Trang ${visiblePage}`}
                      aria-current={visiblePage === page ? "page" : undefined}
                      className={`flex min-w-10 items-center justify-center rounded-lg border px-3 py-2 text-sm font-semibold ${
                        visiblePage === page
                          ? "border-red-600 bg-red-600 text-white"
                          : "border-slate-200 text-slate-700 hover:border-red-300 hover:text-red-700"
                      }`}
                    >
                      {visiblePage}
                    </Link>
                  </div>
                ))}
                {page < totalPages && (
                  <Link
                    href={pageHref(page + 1)}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-red-300 hover:text-red-700"
                  >
                    Trang sau
                  </Link>
                )}
              </nav>
            )}
          </section>
        </div>
      </div>

      <section className="border-t border-slate-800 bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-start">
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-white">
                Tổng đài đặt xe 24/7
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                Đón trả tận nhà, xe chạy liên tục cả ngày lẫn đêm. Gọi ngay để có
                xe trong 15–30 phút.
              </p>
              <a
                href={info.hotlineHref}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-black text-white hover:bg-red-700"
              >
                <PhoneCall className="h-4 w-4 animate-pulse pointer-events-none" aria-hidden="true" />
                <span>Gọi ngay: {info.hotline}</span>
              </a>
            </div>

            <div>
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-red-300">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                <span>Tuyến xe ghép nổi bật</span>
              </h2>
              <ul className="mt-3 grid gap-x-8 sm:grid-cols-2">
                {routes.slice(0, 6).map((route) => (
                  <li key={route.slug}>
                    <Link
                      href={`/tuyen-lien-tinh/${route.slug}`}
                      className="flex items-center justify-between gap-3 border-b border-white/10 py-2.5 text-sm text-slate-200 hover:text-white"
                    >
                      <span className="truncate">{route.name}</span>
                      <span className="shrink-0 font-bold text-red-300">
                        {route.priceShare1Text}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="/tuyen-lien-tinh"
                className="mt-4 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-white hover:text-red-300"
              >
                Xem tất cả các tuyến
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
