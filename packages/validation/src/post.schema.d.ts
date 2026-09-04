export interface PostValidationRules {
    title: {
        minLength: number;
        maxLength: number;
    };
    summary: {
        minLength: number;
        maxLength: number;
    };
    content: {
        minLength: number;
    };
}
export declare const postValidationRules: PostValidationRules;
export declare function validatePost(data: Record<string, any>): {
    isValid: boolean;
    errors: Record<string, string>;
};
