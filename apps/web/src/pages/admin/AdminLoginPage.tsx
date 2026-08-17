import React, { useState } from 'react';
import { Sparkles, Lock, User, Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useToast } from '../../components/ui/toast';

export interface AdminLoginPageProps {
  onLoginSuccess: (user: any, token: string) => void;
  onNavigate: (path: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLoginSuccess, onNavigate }) => {
  const { showToast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showToast('Đăng nhập thành công', `Chào mừng ${data.user.fullName} trở lại hệ thống Quản trị MBS CMS`, 'success');
        setIsLoading(false);
        onLoginSuccess(data.user, data.accessToken);
      } else {
        setIsLoading(false);
        setErrorMessage(data.message || 'Tên đăng nhập hoặc mật khẩu không chính xác.');
      }
    } catch (err) {
      console.warn('Backend API connection failed, falling back to client-side auth validation:', err);
      
      // Fallback for offline mode or dev testing
      if (
        (username === 'admin' && password === 'admin123') ||
        (username === 'khang.tt' && password === 'admin123') ||
        (username === 'hung.nv' && password === 'admin123') ||
        (username === 'admin@mbs.hochiminhcity.gov.vn' && password === 'admin123')
      ) {
        const mockUser = {
          id: 'usr-01',
          username: username === 'khang.tt' ? 'khang.tt' : 'admin',
          fullName: username === 'khang.tt' ? 'Quản trị viên Lưu Chử Khang' : 'TS. Nguyễn Văn Hùng',
          email: 'admin@mbs.hochiminhcity.gov.vn',
          role: 'SUPER_ADMIN',
          department: 'Ban Giám đốc',
          avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=120&q=80',
        };
        const token = 'mbs_jwt_token_admin_super_access_2026_x88912';

        showToast('Đăng nhập thành công', `Chào mừng ${mockUser.fullName} trở lại hệ thống Quản trị MBS CMS`, 'success');
        setIsLoading(false);
        onLoginSuccess(mockUser, token);
      } else {
        setIsLoading(false);
        setErrorMessage('Không thể kết nối đến Server Backend (:4000). Vui lòng kiểm tra lại!');
      }
    }
  };

  const handleUseDemoAccount = () => {
    setUsername('admin');
    setPassword('admin123');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans select-none">
      {/* Background Decorative Gradient Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-600/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Glassmorphism Login Card */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
        {/* Header Header Brand */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white mx-auto shadow-xl shadow-emerald-950/60 ring-4 ring-emerald-500/20">
            <Sparkles className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-wider">Hệ thống Quản trị Admin CMS</h2>
            <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider mt-0.5">
              Cổng Thông tin Điện tử Ban Quản lý MBS TP.HCM
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-950/80 border border-rose-800 rounded-2xl flex items-center gap-2.5 text-rose-300 text-xs font-semibold animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Username input */}
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Tên đăng nhập / Email *
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Nhập tên đăng nhập (VD: admin)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Mật khẩu truy cập *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Nhập mật khẩu (VD: admin123)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-950/60 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span>Đang xác thực bảo mật...</span>
            ) : (
              <>
                <span>Đăng nhập Quản trị</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Account Quick Fill Card */}
        <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Thử nghiệm hệ thống:
            </span>
            <button
              onClick={handleUseDemoAccount}
              className="text-[11px] font-bold text-emerald-400 hover:underline cursor-pointer"
            >
              [Điền mẫu tự động]
            </button>
          </div>
          <div className="text-[11px] text-slate-400 font-mono space-y-0.5">
            <p>Tên đăng nhập: <strong className="text-white">admin</strong></p>
            <p>Mật khẩu: <strong className="text-white">admin123</strong></p>
          </div>
        </div>

        {/* Return to Public Site Link */}
        <div className="text-center pt-2">
          <button
            onClick={() => onNavigate('/')}
            className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            ← Quay lại Website Public
          </button>
        </div>
      </div>
    </div>
  );
};
