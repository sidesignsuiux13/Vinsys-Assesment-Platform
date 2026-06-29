import { LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  heading: string;
  subtext?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon: Icon, heading, subtext, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 mb-4">
        <Icon className="h-6 w-6 text-neutral-400" />
      </div>
      <h3 className="text-base font-semibold text-neutral-700">{heading}</h3>
      {subtext && <p className="mt-1 text-sm text-neutral-400 max-w-sm">{subtext}</p>}
      {action && (
        <Button className="mt-4" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
