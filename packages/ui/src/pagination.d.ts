import React from 'react';
export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
}
export declare const Pagination: React.FC<PaginationProps>;
