import React, { useState, useRef, useEffect } from 'react';
import { Search, Menu, X, ChevronDown, PhoneCall, ShieldCheck, ShieldAlert, FileText, Newspaper, Building2, HelpCircle, Layers, Calendar, Image as ImageIcon } from 'lucide-react';
import { NAV_LINKS, SITE_INFO } from '../../lib/constants';
import { cn } from '../../lib/utils';
import { MOCK_NEWS, MOCK_DOCUMENTS, MOCK_SERVICES } from '../../lib/mock-data';

export interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isHighContrast?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ currentPath, onNavigate, isHighContrast }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    news: typeof MOCK_NEWS;
    docs: typeof MOCK_DOCUMENTS;
    services: typeof MOCK_SERVICES;
  }>({ news: [], docs: [], services: [] });

  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ news: [], docs: [], services: [] });
      return;
    }
    const q = searchQuery.toLowerCase();
    const matchedNews = MOCK_NEWS.filter(n => n.title.toLowerCase().includes(q) || n.summary.toLowerCase().includes(q)).slice(0, 3);
    const matchedDocs = MOCK_DOCUMENTS.filter(d => d.code.toLowerCase().includes(q) || d.title.toLowerCase().includes(q)).slice(0, 3);
    const matchedServices = MOCK_SERVICES.filter(s => s.title.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)).slice(0, 3);
    setSearchResults({ news: matchedNews, docs: matchedDocs, services: matchedServices });
  }, [searchQuery]);

  // Click outside to close search
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLinkClick = (href: string) => {
    onNavigate(href);
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    setSearchOpen(false);
  };

  return (
    <header className={cn(
      'w-full sticky top-0 z-40 transition-colors shadow-md',
      isHighContrast ? 'bg-black text-yellow-300 border-b border-yellow-500' : 'bg-white text-slate-800'
    )}>
      {/* Banner / Identity Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Logo & Agency Title */}
        <div
          onClick={() => handleLinkClick('/')}
          className="flex items-center gap-3.5 cursor-pointer group select-none"
        >
          {/* Emblem Icon */}
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-red-600 via-red-700 to-amber-600 p-0.5 shadow-md flex items-center justify-center shrink-0 border-2 border-amber-300">
            <div className="w-full h-full rounded-full bg-red-700 flex flex-col items-center justify-center text-amber-300 text-center p-1">
              <span className="text-[10px] font-black tracking-tighter uppercase leading-none">MBS</span>
              <div className="w-6 h-0.5 bg-amber-400 my-0.5 rounded-full"></div>
              <span className="text-[7px] font-bold text-amber-200 uppercase leading-none">TP.HCM</span>
            </div>
            {/* Gold Star Badge Accent */}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 text-red-700 rounded-full flex items-center justify-center text-[10px] shadow-xs font-bold">
              ★
            </div>
          </div>

          {/* Text Branding */}
          <div className="flex flex-col">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 group-hover:text-emerald-700 transition-colors">
              SỞ NÔNG NGHIỆP VÀ MÔI TRƯỜNG
            </span>
            <h1 className="text-base sm:text-lg md:text-xl font-extrabold text-emerald-900 leading-tight tracking-tight uppercase group-hover:text-emerald-700 transition-colors">
              BAN QUẢN LÝ CÁC KHU LIÊN HỢP XỬ LÝ CHẤT THẢI
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-[11px] sm:text-xs font-bold text-red-600 uppercase tracking-widest">
                CỔNG THÔNG TIN ĐIỆN TỬ (MBS)
              </span>
              <span className="hidden md:inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="hidden md:inline-block text-[11px] text-slate-500 italic">
                Vì môi trường TP.HCM Xanh - Sạch - Hiện đại
              </span>
            </div>
          </div>
        </div>

        {/* Right side: Hotline & Quick Search Trigger */}
        <div className="hidden lg:flex items-center gap-4">
          {/* Admin CMS Button */}
          <button
            onClick={() => onNavigate('/admin/dashboard')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 text-emerald-400 border border-slate-700 hover:bg-slate-800 hover:scale-105 transition-all text-xs font-bold shadow-md cursor-pointer"
            title="Vào Trang Quản trị Admin CMS"
          >
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            <span>Trang Quản trị</span>
          </button>

          {/* Hotline pill */}
          <a
            href="tel:1900888868"
            className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform animate-pulse">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-red-500 block leading-none">Đường dây nóng 24/7</span>
              <strong className="text-sm font-black text-red-700 leading-tight">1900 8888 68</strong>
            </div>
          </a>

          {/* Quick Search Bar */}
          <div ref={searchContainerRef} className="relative w-64 xl:w-72">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                placeholder="Tìm kiếm văn bản, tin tức..."
                className="w-full pl-9 pr-4 py-2 rounded-full border border-slate-300 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-xs"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Search Dropdown Results */}
            {searchOpen && searchQuery.trim() && (
              <div className="absolute right-0 top-full mt-2 w-96 max-h-96 overflow-y-auto bg-white rounded-xl shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Kết quả tìm kiếm cho: "{searchQuery}"</span>
                  <button onClick={() => setSearchOpen(false)} className="text-slate-400 hover:text-slate-600 text-xs">Đóng</button>
                </div>

                {searchResults.services.length > 0 && (
                  <div className="mb-3">
                    <span className="text-[11px] font-bold text-emerald-700 uppercase block mb-1">Dịch vụ công ({searchResults.services.length})</span>
                    {searchResults.services.map(s => (
                      <div
                        key={s.id}
                        onClick={() => handleLinkClick(`/dich-vu-cong/${s.id}`)}
                        className="p-2 hover:bg-emerald-50 rounded-lg cursor-pointer transition-colors"
                      >
                        <p className="text-xs font-semibold text-slate-900 line-clamp-1">{s.title}</p>
                        <span className="text-[10px] text-emerald-600 font-medium">Mức độ {s.level} • {s.duration}</span>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.docs.length > 0 && (
                  <div className="mb-3">
                    <span className="text-[11px] font-bold text-blue-700 uppercase block mb-1">Văn bản pháp quy ({searchResults.docs.length})</span>
                    {searchResults.docs.map(d => (
                      <div
                        key={d.id}
                        onClick={() => handleLinkClick(`/van-ban/${d.id}`)}
                        className="p-2 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                      >
                        <p className="text-xs font-semibold text-slate-900 line-clamp-1">{d.code}: {d.title}</p>
                        <span className="text-[10px] text-slate-500">{d.issuingAgency} • {d.issueDate}</span>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.news.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-slate-700 uppercase block mb-1">Tin tức ({searchResults.news.length})</span>
                    {searchResults.news.map(n => (
                      <div
                        key={n.id}
                        onClick={() => handleLinkClick(`/tin-tuc/${n.slug}`)}
                        className="p-2 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                      >
                        <p className="text-xs font-semibold text-slate-900 line-clamp-1">{n.title}</p>
                        <span className="text-[10px] text-slate-500">{n.publishedAt.substring(0, 10)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.services.length === 0 && searchResults.docs.length === 0 && searchResults.news.length === 0 && (
                  <div className="text-center py-6 text-xs text-slate-500">
                    Không tìm thấy nội dung phù hợp với "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className={cn(
        'w-full border-t transition-colors shadow-inner hidden lg:block',
        isHighContrast
          ? 'bg-yellow-400 text-black border-yellow-500 font-bold'
          : 'bg-emerald-800 text-white border-emerald-900'
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center justify-between text-sm font-medium">
            {NAV_LINKS.map((item) => {
              const isCurrent = currentPath === item.href || (item.href !== '/' && currentPath.startsWith(item.href));
              const hasChildren = item.children && item.children.length > 0;

              return (
                <li
                  key={item.label}
                  className="relative group py-2.5"
                  onMouseEnter={() => hasChildren && setActiveDropdown(item.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    onClick={() => handleLinkClick(item.href)}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1 rounded-md transition-all whitespace-nowrap cursor-pointer',
                      isCurrent
                        ? 'bg-emerald-950/70 text-amber-300 font-bold shadow-xs'
                        : 'text-emerald-50 hover:bg-emerald-700 hover:text-white'
                    )}
                  >
                    <span>{item.label}</span>
                    {hasChildren && <ChevronDown className="w-3.5 h-3.5 opacity-70 group-hover:rotate-180 transition-transform duration-200" />}
                  </button>

                  {/* Desktop Dropdown */}
                  {hasChildren && activeDropdown === item.label && (
                    <div className="absolute left-0 top-full pt-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="w-64 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 py-2 overflow-hidden">
                        {item.children!.map((subItem) => (
                          <button
                            key={subItem.label}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLinkClick(subItem.href);
                            }}
                            className="w-full text-left px-4 py-2.5 text-xs md:text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 hover:font-semibold transition-colors flex items-center justify-between cursor-pointer"
                          >
                            <span>{subItem.label}</span>
                            <span className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">›</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-auto bg-white border-b border-slate-200 shadow-2xl max-h-[85vh] overflow-y-auto p-4 z-50 animate-in slide-in-from-top duration-200">
          {/* Mobile Search input */}
          <div className="relative mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm nội dung..."
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          </div>

          <ul className="divide-y divide-slate-100 text-sm font-medium">
            {NAV_LINKS.map((item) => (
              <li key={item.label} className="py-2">
                <button
                  onClick={() => handleLinkClick(item.href)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg font-semibold flex items-center justify-between',
                    currentPath === item.href ? 'bg-emerald-50 text-emerald-800' : 'text-slate-800 hover:bg-slate-50'
                  )}
                >
                  <span>{item.label}</span>
                </button>
                {item.children && (
                  <div className="pl-4 mt-1 space-y-1">
                    {item.children.map((subItem) => (
                      <button
                        key={subItem.label}
                        onClick={() => handleLinkClick(subItem.href)}
                        className="w-full text-left px-3 py-1.5 text-xs text-slate-600 hover:text-emerald-700 block"
                      >
                        • {subItem.label}
                      </button>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-6 pt-4 border-t border-slate-200 space-y-3">
            <a
              href="tel:1900888868"
              className="flex items-center justify-center gap-2 py-3 rounded-lg bg-red-600 text-white font-bold text-sm shadow-xs"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Đường dây nóng: 1900 8888 68</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
