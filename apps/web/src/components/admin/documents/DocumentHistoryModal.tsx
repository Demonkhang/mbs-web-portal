import React from 'react';
import { History, X, Clock, UserCheck, ShieldCheck } from 'lucide-react';
import { Button } from '../../ui/button';

export interface DocumentHistoryModalProps {
  historyDoc: any | null;
  historyLogs: any[];
  isLoadingHistory: boolean;
  onClose: () => void;
}

export const DocumentHistoryModal: React.FC<DocumentHistoryModalProps> = ({
  historyDoc,
  historyLogs,
  isLoadingHistory,
  onClose,
}) => {
  if (!historyDoc) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 bg-emerald-900 text-white flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center text-emerald-200 border border-emerald-700">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Lịch sử hoạt động văn bản</h3>
              <p className="text-xs text-emerald-200 font-mono mt-0.5">
                {historyDoc.docCode || historyDoc.code} - {historyDoc.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {isLoadingHistory ? (
            <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
              <Clock className="w-6 h-6 animate-spin text-emerald-700" />
              <span>Đang tải nhật ký lịch sử từ máy chủ CSDL...</span>
            </div>
          ) : historyLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs space-y-2">
              <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto" />
              <p>Chưa có nhật ký ghi nhận chỉnh sửa nào cho văn bản này.</p>
            </div>
          ) : (
            <div className="relative pl-6 border-l-2 border-emerald-200 space-y-6">
              {historyLogs.map((log: any, idx: number) => (
                <div key={log.id || idx} className="relative group">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-emerald-600 ring-4 ring-white flex items-center justify-center text-[10px] text-white">
                    ✓
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 group-hover:border-emerald-300 transition-colors">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                        {log.user?.fullName || log.userName || 'Hệ thống Admin'}
                      </span>
                      <span className="font-mono text-slate-400 text-[11px]">
                        {new Date(log.createdAt || log.timestamp).toLocaleString('vi-VN')}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60 inline-block">
                      {log.action || log.description}
                    </p>

                    {log.details && (
                      <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 font-mono space-y-1">
                        {typeof log.details === 'string' ? (
                          <p>{log.details}</p>
                        ) : (
                          Object.entries(log.details).map(([k, v]: [string, any]) => (
                            <div key={k} className="flex justify-between border-b border-slate-100 last:border-0 py-0.5">
                              <span className="text-slate-400">{k}:</span>
                              <strong className="text-slate-800">{String(v)}</strong>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose} className="font-bold">
            Đóng cửa sổ
          </Button>
        </div>
      </div>
    </div>
  );
};
