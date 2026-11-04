import { MapPin, Clock, DollarSign, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/admin/components/ui/Badge';
import type { RouteDoc, RouteStatus } from '@/admin/types/routes';

interface RoutePreviewProps {
  data: {
    name: string;
    slug: string;
    origin: string;
    destination: string;
    distance: string;
    duration: string;
    description: string;
    status: RouteStatus;
    regions: string[];
    priceFrom: number | null;
    thumbnailUrl?: string | null;
    operatingHoursText?: string;
    frequencyText?: string;
    pickups?: { text: string }[];
    dropoffs?: { text: string }[];
  };
}

const statusConfig: Record<RouteStatus, { label: string; className: string }> = {
  active: { label: 'Hoạt động', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  draft: { label: 'Bản nháp', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  archived: { label: 'Lưu trữ', className: 'bg-slate-100 text-slate-600 border-slate-200' },
  inactive: { label: 'Tạm dừng', className: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export function RoutePreview({ data }: RoutePreviewProps) {
  const statusStyle = statusConfig[data.status] || statusConfig.draft;
  const cleanPickups = data.pickups?.filter((p) => p.text.trim()) || [];
  const cleanDropoffs = data.dropoffs?.filter((d) => d.text.trim()) || [];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Hero Section */}
      <div className="relative h-48 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 overflow-hidden">
        {data.thumbnailUrl ? (
          <img
            src={data.thumbnailUrl}
            alt={data.name || 'Ảnh tuyến'}
            className="w-full h-full object-cover mix-blend-overlay opacity-70"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <MapPin className="w-16 h-16 text-white/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <Badge variant="outline" className={statusStyle.className}>
            {statusStyle.label}
          </Badge>
        </div>

        {/* Route Title */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h2 className="text-xl font-bold text-white truncate">
            {data.name || 'Tên tuyến đường'}
          </h2>
          <div className="flex items-center gap-2 mt-1 text-white/80 text-sm">
            <span className="font-medium">{data.origin || 'Điểm đi'}</span>
            <span className="text-white/60">⇄</span>
            <span className="font-medium">{data.destination || 'Điểm đến'}</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-4">
        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-3">
          {data.distance && (
            <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-slate-500 uppercase tracking-wide">Cự ly</p>
                <p className="text-xs font-semibold text-slate-800 truncate">{data.distance}</p>
              </div>
            </div>
          )}
          {data.duration && (
            <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg">
              <Clock className="w-4 h-4 text-blue-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-slate-500 uppercase tracking-wide">Thời gian</p>
                <p className="text-xs font-semibold text-slate-800 truncate">{data.duration}</p>
              </div>
            </div>
          )}
          {data.operatingHoursText && (
            <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-slate-500 uppercase tracking-wide">Giờ hoạt động</p>
                <p className="text-xs font-semibold text-slate-800 truncate">{data.operatingHoursText}</p>
              </div>
            </div>
          )}
          {data.priceFrom != null && data.priceFrom > 0 && (
            <div className="flex items-center gap-2 p-2.5 bg-blue-50 rounded-lg border border-blue-100">
              <DollarSign className="w-4 h-4 text-blue-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-blue-600 uppercase tracking-wide font-medium">Giá từ</p>
                <p className="text-xs font-bold text-blue-800 truncate">
                  {data.priceFrom.toLocaleString('vi-VN')}đ
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        {data.description && (
          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide font-semibold">Mô tả</p>
            <p className="text-xs text-slate-700 leading-relaxed line-clamp-3">
              {data.description}
            </p>
          </div>
        )}

        {/* Regions */}
        {data.regions.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide font-semibold">Khu vực</p>
            <div className="flex flex-wrap gap-1.5">
              {data.regions.map((region) => (
                <span
                  key={region}
                  className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full font-medium"
                >
                  {region}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Pickups & Dropoffs */}
        {(cleanPickups.length > 0 || cleanDropoffs.length > 0) && (
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            {cleanPickups.length > 0 && (
              <div className="space-y-1">
                <p className="text-[10px] text-emerald-600 uppercase tracking-wide font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Điểm đón ({cleanPickups.length})
                </p>
                <ul className="space-y-0.5">
                  {cleanPickups.slice(0, 3).map((p, i) => (
                    <li key={i} className="text-[11px] text-slate-600 truncate">
                      • {p.text}
                    </li>
                  ))}
                  {cleanPickups.length > 3 && (
                    <li className="text-[10px] text-slate-400 italic">
                      +{cleanPickups.length - 3} điểm khác...
                    </li>
                  )}
                </ul>
              </div>
            )}
            {cleanDropoffs.length > 0 && (
              <div className="space-y-1">
                <p className="text-[10px] text-rose-600 uppercase tracking-wide font-semibold flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  Điểm trả ({cleanDropoffs.length})
                </p>
                <ul className="space-y-0.5">
                  {cleanDropoffs.slice(0, 3).map((d, i) => (
                    <li key={i} className="text-[11px] text-slate-600 truncate">
                      • {d.text}
                    </li>
                  ))}
                  {cleanDropoffs.length > 3 && (
                    <li className="text-[10px] text-slate-400 italic">
                      +{cleanDropoffs.length - 3} điểm khác...
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Frequency */}
        {data.frequencyText && (
          <div className="pt-2 border-t border-slate-100">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide font-semibold">Tần suất</p>
            <p className="text-xs text-slate-700 mt-0.5">{data.frequencyText}</p>
          </div>
        )}

        {/* URL Preview */}
        <div className="pt-2 border-t border-slate-100">
          <p className="text-[10px] text-slate-500 uppercase tracking-wide font-semibold mb-1">URL công khai</p>
          <code className="text-[11px] text-blue-600 bg-blue-50 px-2 py-1 rounded block truncate font-mono">
            /tuyen-lien-tinh/{data.slug || 'chua-co-slug'}
          </code>
        </div>
      </div>
    </div>
  );
}

export default RoutePreview;
