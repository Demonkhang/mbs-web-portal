import React from 'react';
export interface AccordionItemData {
    id: string;
    title: string;
    content: React.ReactNode;
    defaultOpen?: boolean;
}
export interface AccordionProps {
    items: AccordionItemData[];
    allowMultiple?: boolean;
    className?: string;
}
export declare const Accordion: React.FC<AccordionProps>;
