import React from 'react';
export interface TabItem {
    id: string;
    label: string;
    count?: number;
    icon?: React.ReactNode;
}
export interface TabsProps {
    tabs: TabItem[];
    activeTab: string;
    onChange: (tabId: string) => void;
    variant?: 'underline' | 'pills' | 'enclosed';
    className?: string;
}
export declare const Tabs: React.FC<TabsProps>;
