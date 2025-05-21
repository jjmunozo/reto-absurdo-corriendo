
import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  className?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'secondary';
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  className,
  icon,
  variant = 'default',
  onClick
}) => {
  return (
    <Card 
      className={cn(
        'p-4 h-full', 
        variant === 'secondary' && 'border-running-light border-opacity-50',
        onClick && 'cursor-pointer hover:border-running-primary transition-colors',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={cn(
            "text-sm font-medium",
            variant === 'default' ? 'text-muted-foreground' : 'text-gray-600'
          )}>{title}</p>
          <h3 className={cn(
            "text-2xl font-bold mt-1",
            variant === 'secondary' && 'text-running-primary'
          )}>{value}</h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        {icon && <div className={cn(
          variant === 'default' ? 'text-running-primary' : 'text-running-light'
        )}>{icon}</div>}
      </div>
    </Card>
  );
};

export default StatCard;
