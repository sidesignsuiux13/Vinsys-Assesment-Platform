import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface Crumb {
  label: string;
  to?: string;
}

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm mb-4">
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {item.to && !last ? (
              <Link to={item.to} className="text-neutral-400 hover:text-maroon-600">
                {item.label}
              </Link>
            ) : (
              <span className={last ? 'text-neutral-700 font-medium' : 'text-neutral-400'}>
                {item.label}
              </span>
            )}
            {!last && <ChevronRight className="h-4 w-4 text-neutral-300" />}
          </span>
        );
      })}
    </nav>
  );
}
