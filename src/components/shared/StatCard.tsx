import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: LucideIcon;
}

export function StatCard({ label, value, subtext, icon: Icon }: StatCardProps) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-neutral-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-maroon-600">{value}</p>
          {subtext && <p className="mt-1 text-xs text-neutral-400">{subtext}</p>}
        </div>
        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-maroon-50">
            <Icon className="h-5 w-5 text-maroon-600" />
          </div>
        )}
      </div>
    </div>
  );
}
