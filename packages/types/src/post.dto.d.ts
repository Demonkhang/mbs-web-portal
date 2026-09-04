export type PostStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'PUBLISHED' | 'ARCHIVED';
export interface PostDto {
    id: string;
    slug: string;
    title: string;
    summary: string;
    content: string;
    categoryId: string;
    categoryName: string;
    categorySlug: string;
    publishedAt?: string;
    author: string;
    authorId?: string;
    views: number;
    imageUrl: string;
    imageCaption?: string;
    isFeatured: boolean;
    isSpotlight: boolean;
    tags: string[];
    status: PostStatus;
    metaTitle?: string;
    metaDescription?: string;
    readingTime?: number;
    createdAt: string;
    updatedAt: string;
}
export interface CreatePostDto {
    title: string;
    summary: string;
    content: string;
    categoryId: string;
    imageUrl: string;
    imageCaption?: string;
    isFeatured?: boolean;
    isSpotlight?: boolean;
    tags?: string[];
    metaTitle?: string;
    metaDescription?: string;
}
export interface UpdatePostDto extends Partial<CreatePostDto> {
    status?: PostStatus;
}
