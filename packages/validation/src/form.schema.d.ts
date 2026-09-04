export declare function validateFeedbackForm(data: {
    senderName?: string;
    senderPhone?: string;
    senderEmail?: string;
    title?: string;
    description?: string;
}): {
    isValid: boolean;
    errors: Record<string, string>;
};
