import React, { useState, useEffect } from 'react';
import { TopBar } from './components/layout/TopBar';
import { Header } from './components/layout/Header';
import { BreakingNewsTicker } from './components/layout/BreakingNewsTicker';
import { Footer } from './components/layout/Footer';
import { QuickAccessMenu } from './components/layout/QuickAccessMenu';
import { FeedbackModal } from './components/shared/FeedbackModal';
import { ToastProvider } from './components/ui/toast';
import { AdminLayout } from './components/layout/AdminLayout';

// Public Pages
import { HomePage } from './pages/HomePage';
import { NewsPage } from './pages/NewsPage';
import { NewsDetailPage } from './pages/NewsDetailPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { DocumentDetailPage } from './pages/DocumentDetailPage';
import { PublicServicesPage } from './pages/PublicServicesPage';
import { PublicServiceDetailPage } from './pages/PublicServiceDetailPage';
import { OrgStructurePage } from './pages/OrgStructurePage';
import { WorkSchedulePage } from './pages/WorkSchedulePage';
import { FeedbackPage } from './pages/FeedbackPage';
import { FaqPage } from './pages/FaqPage';
import { MediaPage } from './pages/MediaPage';
import { ContactPage } from './pages/ContactPage';

// Admin CMS Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminPostsPage } from './pages/admin/AdminPostsPage';
import { AdminPostEditorPage } from './pages/admin/AdminPostEditorPage';
import { AdminApprovalsPage } from './pages/admin/AdminApprovalsPage';
import { AdminDocumentsPage } from './pages/admin/AdminDocumentsPage';
import { AdminSubmissionsPage } from './pages/admin/AdminSubmissionsPage';
import { AdminFeedbackPage } from './pages/admin/AdminFeedbackPage';
import { AdminFormBuilderPage } from './pages/admin/AdminFormBuilderPage';
import { AdminMediaPage } from './pages/admin/AdminMediaPage';
import { AdminOrgStaffPage } from './pages/admin/AdminOrgStaffPage';
import { AdminSchedulesPollsPage } from './pages/admin/AdminSchedulesPollsPage';
import { AdminUsersAuditSettingsPage } from './pages/admin/AdminUsersAuditSettingsPage';
import { AdminRolesPermissionsPage } from './pages/admin/AdminRolesPermissionsPage';

export function App() {
  const [currentPath, setCurrentPath] = useState('/');
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  // Authentication State
  const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem('mbs_admin_token'));
  const [authUser, setAuthUser] = useState<any>(() => {
    const saved = localStorage.getItem('mbs_admin_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Sync hash/path on initial load and popstate
  useEffect(() => {
    const handleLocationChange = () => {
      const hash = window.location.hash.replace('#', '') || '/';
      setCurrentPath(hash);
    };

    window.addEventListener('popstate', handleLocationChange);
    handleLocationChange();

    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigate = (path: string) => {
    setCurrentPath(path);
    window.location.hash = path;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (user: any, token: string) => {
    setAuthUser(user);
    setAuthToken(token);
    localStorage.setItem('mbs_admin_token', token);
    localStorage.setItem('mbs_access_token', token);
    localStorage.setItem('mbs_token', token);
    localStorage.setItem('mbs_admin_user', JSON.stringify(user));
    navigate('/admin/dashboard');
  };

  const handleLogout = () => {
    setAuthUser(null);
    setAuthToken(null);
    localStorage.removeItem('mbs_admin_token');
    localStorage.removeItem('mbs_access_token');
    localStorage.removeItem('mbs_token');
    localStorage.removeItem('mbs_admin_user');
    navigate('/admin/login');
  };


  const isAdminRoute = currentPath.startsWith('/admin');

  // Admin Route Resolver with Protected Auth Guard
  const renderAdminView = () => {
    // 1. Explicit Login Route
    if (currentPath === '/admin/login') {
      return <AdminLoginPage onLoginSuccess={handleLoginSuccess} onNavigate={navigate} />;
    }

    // 2. Auth Guard: If not authenticated, force render Login Page
    if (!authToken) {
      return <AdminLoginPage onLoginSuccess={handleLoginSuccess} onNavigate={navigate} />;
    }

    // 3. Authenticated Admin Views
    if (currentPath === '/admin/analytics/reports') {
      return <AdminDashboardPage onNavigate={navigate} subTab="reports" />;
    }
    if (currentPath === '/admin/posts/new') {
      return <AdminPostEditorPage onNavigate={navigate} />;
    }
    if (currentPath.startsWith('/admin/posts/') && currentPath.endsWith('/edit')) {
      const postId = currentPath.replace('/admin/posts/', '').replace('/edit', '');
      return <AdminPostEditorPage onNavigate={navigate} postId={postId} />;
    }
    if (currentPath === '/admin/approvals' || currentPath === '/admin/posts/approvals') {
      return <AdminApprovalsPage onNavigate={navigate} />;
    }
    if (currentPath === '/admin/categories') {
      return <AdminPostsPage onNavigate={navigate} subView="categories" />;
    }
    if (currentPath === '/admin/pages') {
      return <AdminPostsPage onNavigate={navigate} subView="pages" />;
    }
    if (currentPath === '/admin/posts') {
      return <AdminPostsPage onNavigate={navigate} subView="posts" />;
    }
    if (currentPath === '/admin/documents/new') {
      return <AdminDocumentsPage onNavigate={navigate} subView="new" />;
    }
    if (currentPath === '/admin/documents') {
      return <AdminDocumentsPage onNavigate={navigate} subView="list" />;
    }
    if (currentPath === '/admin/submissions') {
      return <AdminSubmissionsPage onNavigate={navigate} />;
    }
    if (currentPath === '/admin/inquiries/faq') {
      return <AdminFeedbackPage onNavigate={navigate} subTab="faq" />;
    }
    if (currentPath === '/admin/inquiries/feedback') {
      return <AdminFeedbackPage onNavigate={navigate} subTab="feedback" />;
    }
    if (currentPath === '/admin/forms/builder') {
      return <AdminFormBuilderPage onNavigate={navigate} />;
    }
    if (currentPath === '/admin/e-magazine') {
      return <AdminMediaPage onNavigate={navigate} subTab="emagazine" />;
    }
    if (currentPath === '/admin/media') {
      return <AdminMediaPage onNavigate={navigate} subTab="media" />;
    }
    if (currentPath === '/admin/staff') {
      return <AdminOrgStaffPage onNavigate={navigate} subTab="staff" />;
    }
    if (currentPath === '/admin/organization') {
      return <AdminOrgStaffPage onNavigate={navigate} subTab="org" />;
    }
    if (currentPath === '/admin/polls') {
      return <AdminSchedulesPollsPage onNavigate={navigate} subTab="polls" />;
    }
    if (currentPath === '/admin/banners') {
      return <AdminSchedulesPollsPage onNavigate={navigate} subTab="banners" />;
    }
    if (currentPath === '/admin/schedules') {
      return <AdminSchedulesPollsPage onNavigate={navigate} subTab="schedules" />;
    }
    if (currentPath === '/admin/audit-logs') {
      return <AdminUsersAuditSettingsPage onNavigate={navigate} subTab="audit" />;
    }
    if (currentPath === '/admin/settings') {
      return <AdminUsersAuditSettingsPage onNavigate={navigate} subTab="settings" />;
    }
    if (currentPath === '/admin/users') {
      return <AdminUsersAuditSettingsPage onNavigate={navigate} subTab="users" />;
    }
    if (currentPath === '/admin/roles') {
      return <AdminRolesPermissionsPage />;
    }

    // Default admin dashboard
    return <AdminDashboardPage onNavigate={navigate} subTab="overview" />;
  };

  // Public Route Resolver
  const renderPublicPage = () => {
    if (currentPath === '/' || currentPath === '') {
      return <HomePage onNavigate={navigate} onOpenFeedback={() => setIsFeedbackModalOpen(true)} />;
    }
    if (currentPath.startsWith('/tin-tuc/')) {
      const slug = currentPath.replace('/tin-tuc/', '');
      return (
        <NewsDetailPage
          slug={slug}
          onNavigate={navigate}
          fontSize={fontSize}
          onChangeFontSize={setFontSize}
        />
      );
    }
    if (currentPath.startsWith('/tin-tuc')) {
      const queryParams = new URLSearchParams(currentPath.split('?')[1] || '');
      const cat = queryParams.get('cat') || 'all';
      return <NewsPage onNavigate={navigate} initialCategory={cat} />;
    }
    if (currentPath.startsWith('/van-ban/')) {
      const id = currentPath.replace('/van-ban/', '');
      return <DocumentDetailPage id={id} onNavigate={navigate} />;
    }
    if (currentPath === '/van-ban') {
      return <DocumentsPage onNavigate={navigate} />;
    }
    if (currentPath.startsWith('/dich-vu-cong/')) {
      const id = currentPath.replace('/dich-vu-cong/', '');
      return <PublicServiceDetailPage id={id} onNavigate={navigate} />;
    }
    if (currentPath.startsWith('/dich-vu-cong')) {
      const defaultTab = currentPath.includes('#tra-cuu') || currentPath.includes('#tracking') ? 'tracking' : 'services';
      return <PublicServicesPage onNavigate={navigate} defaultTab={defaultTab} />;
    }
    if (currentPath.startsWith('/gioi-thieu') || currentPath.startsWith('/so-do-to-chuc')) {
      const queryParams = new URLSearchParams(currentPath.split('?')[1] || '');
      const tabParam = queryParams.get('tab') || undefined;
      return <OrgStructurePage onNavigate={navigate} initialTab={tabParam} />;
    }
    if (currentPath === '/lich-cong-tac') {
      return <WorkSchedulePage onNavigate={navigate} />;
    }
    if (currentPath === '/phan-anh') {
      return <FeedbackPage onNavigate={navigate} />;
    }
    if (currentPath === '/faq' || currentPath === '/hoi-dap') {
      return <FaqPage onNavigate={navigate} />;
    }
    if (currentPath === '/media' || currentPath === '/thu-vien-anh') {
      return <MediaPage onNavigate={navigate} />;
    }

    if (currentPath === '/lien-he') {
      return <ContactPage onNavigate={navigate} />;
    }

    return <HomePage onNavigate={navigate} onOpenFeedback={() => setIsFeedbackModalOpen(true)} />;
  };

  const fontSizeClass = {
    normal: 'text-sm',
    large: 'text-base',
    xlarge: 'text-lg',
  }[fontSize];

  return (
    <ToastProvider>
      {isAdminRoute ? (
        currentPath === '/admin/login' || !authToken ? (
          <AdminLoginPage onLoginSuccess={handleLoginSuccess} onNavigate={navigate} />
        ) : (
          <AdminLayout currentPath={currentPath} onNavigate={navigate} onLogout={handleLogout}>
            {renderAdminView()}
          </AdminLayout>
        )
      ) : (
        <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${isHighContrast ? 'contrast-125 saturate-150 bg-amber-50/20' : 'bg-slate-50'}`}>
          {/* Accessibility & Quick Utilities TopBar */}
          <TopBar
            isHighContrast={isHighContrast}
            onToggleHighContrast={() => setIsHighContrast((prev) => !prev)}
            fontSize={fontSize}
            onChangeFontSize={setFontSize}
            onNavigate={navigate}
          />

          {/* Official Banner & Main Navigation Header */}
          <Header currentPath={currentPath} onNavigate={navigate} />

          {/* Emergency Breaking News Ticker */}
          <BreakingNewsTicker onNavigate={navigate} />

          {/* Dynamic Route Content */}
          <main
            className={`flex-1 transition-all duration-200 ${fontSizeClass}`}
            style={{
              fontSize: fontSize === 'large' ? '1.1rem' : fontSize === 'xlarge' ? '1.25rem' : '1rem'
            }}
          >
            {renderPublicPage()}
          </main>

          {/* Official Governmental Footer */}
          <Footer onNavigate={navigate} />

          {/* Speed-dial Quick Access Floating Button Menu */}
          <QuickAccessMenu
            onOpenFeedback={() => setIsFeedbackModalOpen(true)}
            onNavigate={navigate}
          />

          {/* Interactive Global Feedback Modal */}
          <FeedbackModal
            isOpen={isFeedbackModalOpen}
            onClose={() => setIsFeedbackModalOpen(false)}
          />
        </div>
      )}
    </ToastProvider>
  );
}

export default App;
