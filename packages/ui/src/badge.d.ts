import React from 'react';
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline' | 'gov';
    size?: 'sm' | 'md' | 'lg';
}
export declare const Badge: React.FC<BadgeProps>;
