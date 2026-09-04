import React from 'react';
export interface BreadcrumbItem {
    label: string;
    href?: string;
    onClick?: () => void;
}
export interface BreadcrumbProps {
    items: BreadcrumbItem[];
    className?: string;
    onNavigate?: (path: string) => void;
}
export declare const Breadcrumb: React.FC<BreadcrumbProps>;
