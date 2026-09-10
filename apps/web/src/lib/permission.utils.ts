export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'EDITOR_LEAD'
  | 'EDITOR'
  | 'OFFICER'
  | 'CITIZEN'
  | 'ENTERPRISE';

export interface RoleInfo {
  code: UserRole;
  title: string;
  badgeClass: string;
  description: string;
}

export const ROLE_DEFINITIONS: Record<UserRole, RoleInfo> = {
  SUPER_ADMIN: {
    code: 'SUPER_ADMIN',
    title: 'Quản trị tối cao (Super Admin)',
    badgeClass: 'bg-rose-950 text-rose-300 border-rose-800',
    description: 'Toàn quyền điều hành hệ thống, quản lý tài khoản, nhật ký audit và cấu hình server.',
  },
  ADMIN: {
    code: 'ADMIN',
    title: 'Quản trị viên Hệ thống',
    badgeClass: 'bg-purple-950 text-purple-300 border-purple-800',
    description: 'Quản lý tài khoản cán bộ, chuyên mục, biểu mẫu dịch vụ công và phân quyền.',
  },
  EDITOR_LEAD: {
    code: 'EDITOR_LEAD',
    title: 'Trưởng Ban Biên tập',
    badgeClass: 'bg-emerald-950 text-emerald-300 border-emerald-800',
    description: 'Biên tập, phê duyệt xuất bản bài viết, quản lý chuyên mục tin bài và văn bản.',
  },
  EDITOR: {
    code: 'EDITOR',
    title: 'Biên tập viên Tin bài',
    badgeClass: 'bg-sky-950 text-sky-300 border-sky-800',
    description: 'Soạn thảo tin bài, trình duyệt nội dung bài viết và xem văn bản.',
  },
  OFFICER: {
    code: 'OFFICER',
    title: 'Chuyên viên Thụ lý Hồ sơ',
    badgeClass: 'bg-amber-950 text-amber-300 border-amber-800',
    description: 'Tiếp nhận, thẩm định hồ sơ Dịch vụ công và phản ánh môi trường của người dân.',
  },
  CITIZEN: {
    code: 'CITIZEN',
    title: 'Người dân / Công dân',
    badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
    description: 'Tra cứu tin tức, văn bản, nộp hồ sơ dịch vụ công và gửi phản ánh môi trường.',
  },
  ENTERPRISE: {
    code: 'ENTERPRISE',
    title: 'Doanh nghiệp / Tổ chức',
    badgeClass: 'bg-teal-950 text-teal-300 border-teal-800',
    description: 'Đăng ký dịch vụ công trực tuyến và theo dõi hồ sơ pháp lý chuyên ngành.',
  },
};

/**
 * Returns allowed Admin CMS routes for a given role
 */
export function getAllowedAdminRoutes(role: UserRole | string): string[] {
  switch (role) {
    case 'SUPER_ADMIN':
    case 'ADMIN':
      return [
        '/admin/dashboard',
        '/admin/analytics/reports',
        '/admin/posts',
        '/admin/posts/new',
        '/admin/categories',
        '/admin/approvals',
        '/admin/documents',
        '/admin/media',
        '/admin/submissions',
        '/admin/forms',
        '/admin/inquiries/feedback',
        '/admin/inquiries/faq',
        '/admin/schedules',
        '/admin/organization',
        '/admin/users',
        '/admin/roles',
        '/admin/backup',
        '/admin/audit-logs',
      ];

    case 'EDITOR_LEAD':
      return [
        '/admin/dashboard',
        '/admin/posts',
        '/admin/posts/new',
        '/admin/categories',
        '/admin/approvals',
        '/admin/documents',
        '/admin/media',
        '/admin/inquiries/faq',
        '/admin/schedules',
      ];

    case 'EDITOR':
      return [
        '/admin/dashboard',
        '/admin/posts',
        '/admin/posts/new',
        '/admin/documents',
        '/admin/media',
      ];

    case 'OFFICER':
      return [
        '/admin/dashboard',
        '/admin/submissions',
        '/admin/inquiries/feedback',
        '/admin/documents',
        '/admin/schedules',
      ];

    default:
      return ['/admin/dashboard'];
  }
}

/**
 * Map each Admin path to its required Permission Code
 */
export const ROUTE_PERMISSION_MAP: Record<string, string> = {
  '/admin/dashboard': 'dashboard:view',
  '/admin/analytics/reports': 'audit:view',
  '/admin/posts': 'posts:view',
  '/admin/posts/new': 'posts:create',
  '/admin/approvals': 'posts:approve',
  '/admin/categories': 'categories:manage',
  '/admin/documents': 'documents:view',
  '/admin/media': 'media:upload',
  '/admin/submissions': 'submissions:view',
  '/admin/inquiries/feedback': 'inquiries:view',
  '/admin/inquiries/faq': 'faqs:manage',
  '/admin/schedules': 'schedules:manage',
  '/admin/organization': 'users:view',
  '/admin/users': 'users:view',
  '/admin/roles': 'roles:manage',
  '/admin/backup': 'system:backup',
  '/admin/audit-logs': 'audit:view',
};

/**
 * Check if a role/user is permitted to visit a specific path
 */
export function isRouteAllowed(role: UserRole | string, path: string, userPermissions?: string[]): boolean {
  // Always allow Dashboard & Login
  if (path === '/admin/dashboard' || path === '/admin' || path === '/admin/login') return true;

  // Dynamic permission check if user permissions matrix array is present
  if (Array.isArray(userPermissions) && userPermissions.length > 0) {
    // Normalize path to base route (e.g. /admin/posts/123/edit -> /admin/posts)
    const baseRoute = Object.keys(ROUTE_PERMISSION_MAP).find(
      (r) => path === r || path.startsWith(r + '/')
    ) || path;

    const requiredPerm = ROUTE_PERMISSION_MAP[baseRoute];
    if (!requiredPerm || requiredPerm === 'dashboard:view') return true;

    if (baseRoute === '/admin/approvals') {
      return userPermissions.includes('posts:approve') || userPermissions.includes('posts:approve_leadership');
    }

    return userPermissions.includes(requiredPerm);
  }

  // Fallback for default system role when permissions array is not loaded
  if (role === 'SUPER_ADMIN') return true;

  // Fallback to static role definitions
  const allowed = getAllowedAdminRoutes(role);
  return allowed.some((r) => path === r || path.startsWith(r + '/'));
}

/**
 * Check granular permissions for action components
 */
export function hasPermission(
  role: UserRole | string,
  action: 'manage_users' | 'publish_posts' | 'write_posts' | 'delete_posts' | 'process_submissions' | 'manage_forms' | 'respond_feedback' | 'view_audit_logs',
  userPermissions?: string[]
): boolean {
  if (Array.isArray(userPermissions) && userPermissions.length > 0) {
    const actionCodeMap: Record<string, string> = {
      manage_users: 'users:view',
      view_audit_logs: 'audit:view',
      manage_forms: 'forms:manage',
      delete_posts: 'posts:delete',
      publish_posts: 'posts:approve',
      write_posts: 'posts:create',
      process_submissions: 'submissions:process',
      respond_feedback: 'inquiries:reply',
    };
    const code = actionCodeMap[action];
    if (code) {
      if (action === 'publish_posts') {
        return userPermissions.includes('posts:approve') || userPermissions.includes('posts:approve_leadership') || userPermissions.includes('posts:publish');
      }
      return userPermissions.includes(code);
    }
  }

  if (role === 'SUPER_ADMIN') return true;

  switch (action) {
    case 'manage_users':
    case 'view_audit_logs':
    case 'manage_forms':
      return ['SUPER_ADMIN', 'ADMIN'].includes(role);

    case 'delete_posts':
      return ['SUPER_ADMIN', 'ADMIN'].includes(role);

    case 'publish_posts':
      return ['SUPER_ADMIN', 'ADMIN', 'EDITOR_LEAD'].includes(role);

    case 'write_posts':
      return ['SUPER_ADMIN', 'ADMIN', 'EDITOR_LEAD', 'EDITOR'].includes(role);

    case 'process_submissions':
    case 'respond_feedback':
      return ['SUPER_ADMIN', 'ADMIN', 'OFFICER'].includes(role);

    default:
      return false;
  }
}
