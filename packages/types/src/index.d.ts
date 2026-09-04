export * from './auth.dto';
export * from './post.dto';
export * from './document.dto';
export * from './submission.dto';
export interface NewsCategory {
    id: string;
    name: string;
    slug: string;
}
export interface NewsItem {
    id: string;
    slug: string;
    title: string;
    summary: string;
    content: string;
    category: 'hoat-dong' | 'moi-truong' | 'thong-bao' | 'chi-dao-dieu-hanh' | 'khoa-hoc-cong-nghe';
    categorySlug?: string;
    categoryName: string;
    publishedAt: string;
    author: string;
    views: number;
    imageUrl: string;
    imageCaption?: string;
    isFeatured?: boolean;
    isSpotlight?: boolean;
    tags: string[];
    readingTime?: number;
}
export interface LegalDocument {
    id: string;
    code: string;
    title: string;
    docType: 'Nghị định' | 'Thông tư' | 'Quyết định' | 'Kế hoạch' | 'Thông báo' | 'Công văn';
    issuingAgency: string;
    signer: string;
    issueDate: string;
    effectiveDate: string;
    expirationDate?: string;
    status: 'con-hieu-luc' | 'het-hieu-luc' | 'chua-hieu-luc' | 'bi-thay-the';
    domain: 'Môi trường' | 'Quản lý chất thải rắn' | 'Đầu tư - Xây dựng' | 'Hành chính - Nhân sự' | 'Tài chính - Đấu thầu';
    fileSize: string;
    fileUrl?: string;
    downloadsCount: number;
    viewsCount: number;
    relatedDocs?: {
        basis?: string[];
        guiding?: string[];
        replacedBy?: string;
    };
    fullText: string;
}
export interface PublicService {
    id: string;
    code: string;
    title: string;
    level: 3 | 4;
    field: string;
    targetAudience: string;
    duration: string;
    fee: string;
    result: string;
    implementationAgency: string;
    description: string;
    requirements: string[];
    dossierComponents: {
        name: string;
        quantity: string;
        isOriginal: boolean;
        templateUrl?: string;
    }[];
    steps: {
        order: number;
        title: string;
        description: string;
        duration: string;
        responsible: string;
    }[];
    faqs: {
        question: string;
        answer: string;
    }[];
}
export interface ApplicationTracking {
    trackingCode: string;
    serviceName: string;
    applicantName: string;
    applicantPhone: string;
    applicantEmail: string;
    submissionDate: string;
    expectedDate: string;
    currentStep: number;
    status: 'tiep-nhan' | 'tham-dinh' | 'yeu-cau-bo-sung' | 'hoan-tat' | 'tu-choi';
    statusText: string;
    assignedOfficer: string;
    department: string;
    history: {
        time: string;
        title: string;
        description: string;
        officer: string;
        status: 'completed' | 'in_progress' | 'pending';
    }[];
}
export type ApplicationRecord = ApplicationTracking;
export interface StaffMember {
    id: string;
    name: string;
    position: string;
    department: string;
    email: string;
    phone: string;
    room: string;
    avatarUrl: string;
    isLeader?: boolean;
}
export interface OrgNode {
    id: string;
    title: string;
    leaderName?: string;
    leaderTitle?: string;
    description?: string;
    children?: OrgNode[];
    phone?: string;
    email?: string;
    memberCount?: number;
}
export interface WorkScheduleItem {
    id: string;
    dayOfWeek: string;
    date: string;
    morning: {
        time: string;
        content: string;
        host: string;
        participants: string;
        location: string;
    }[];
    afternoon: {
        time: string;
        content: string;
        host: string;
        participants: string;
        location: string;
    }[];
}
export interface FeedbackReport {
    id: string;
    ticketCode: string;
    title: string;
    senderName: string;
    senderPhone: string;
    senderEmail: string;
    senderAddress: string;
    category: 'o-nhiem-mui' | 'nuoc-ri-rac' | 'tieng-on-khoi-bui' | 'xe-van-chuyen' | 'khac';
    location: string;
    facility: 'Khu LHXLCT Đa Phước' | 'Khu LHXLCT Phước Hiệp (Tây Bắc)' | 'Trạm trung chuyển' | 'Khu vực khác';
    description: string;
    attachmentUrls?: string[];
    createdAt: string;
    status: 'da-tiep-nhan' | 'dang-xu-ly' | 'da-giai-quyet';
    responseContent?: string;
    responseDate?: string;
}
export interface FAQItem {
    id: string;
    category: string;
    question: string;
    answer: string;
    views: number;
}
export interface MediaItem {
    id: string;
    title: string;
    category: 'Khu liên hợp Đa Phước' | 'Khu liên hợp Phước Hiệp' | 'Hoạt động đoàn thể' | 'Công nghệ xử lý rác';
    thumbnailUrl: string;
    type: 'image' | 'video';
    date: string;
    description: string;
    mediaCount?: number;
    videoDuration?: string;
}
export interface Facility {
    id: string;
    name: string;
    location: string;
    status: string;
    image: string;
    area: string;
    capacity: string;
    technologies: string[];
}
