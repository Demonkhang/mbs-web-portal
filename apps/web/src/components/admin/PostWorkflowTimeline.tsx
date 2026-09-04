import React from 'react';
import { ShieldCheck, FileEdit, Award, Globe, AlertTriangle, Clock, User, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';

export interface WorkflowLogItem {
  id: string;
  step: number;
  stepName: string;
  action: string;
  actorId: string;
  actorName: string;
  actorRole?: string;
  assignedToId?: string;
  assignedToName?: string;
  note?: string;
  metadata?: any;
  createdAt: string;
}

export interface PostWorkflowTimelineProps {
  logs: WorkflowLogItem[];
  currentStep?: number;
  assignedToName?: string;
}

export const PostWorkflowTimeline: React.FC<PostWorkflowTimelineProps> = ({ logs, currentStep = 1, assignedToName }) => {
  const getStepBadgeColor = (step: number) => {
    switch (step) {
      case 1:
        return 'bg-sky-950 text-sky-300 border-sky-800';
      case 2:
        return 'bg-purple-950 text-purple-300 border-purple-800';
      case 3:
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 4:
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      case 5:
        return 'bg-rose-950 text-rose-300 border-rose-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1:
        return <ShieldCheck className="w-4 h-4 text-sky-400" />;
      case 2:
        return <FileEdit className="w-4 h-4 text-purple-400" />;
      case 3:
        return <Award className="w-4 h-4 text-amber-400" />;
      case 4:
        return <Globe className="w-4 h-4 text-emerald-400" />;
      case 5:
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Nhật Ký Lịch Sử Thụ Lý 5 Bước (Audit Lineage Timeline)
          </h3>
        </div>
        {assignedToName && (
          <span className="text-xs font-semibold text-amber-300 bg-amber-950/80 border border-amber-800/60 px-3 py-1 rounded-full">
            👤 Đang giao: <strong className="text-amber-200">{assignedToName}</strong> (Bước {currentStep})
          </span>
        )}
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-6 text-xs text-slate-500 font-medium">
          Chưa có nhật ký ghi nhận luồng biên tập cho bài viết này.
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
          {logs.map((item, index) => (
            <div key={item.id || index} className="relative group">
              {/* Dot Icon */}
              <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center shadow-md">
                {getStepIcon(item.step)}
              </div>

              {/* Log Card */}
              <div className="bg-slate-950/90 border border-slate-800/90 hover:border-slate-700 rounded-xl p-4 space-y-2 transition-all shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-900 pb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${getStepBadgeColor(item.step)}`}>
                      {item.stepName || `Bước ${item.step}`}
                    </span>
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {item.actorName}
                      {item.actorRole && <span className="text-[10px] text-slate-400 font-normal">({item.actorRole})</span>}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    {new Date(item.createdAt).toLocaleString('vi-VN')}
                  </span>
                </div>

                {/* Assigned To Note */}
                {item.assignedToName && (
                  <div className="text-xs text-slate-300 flex items-center gap-1.5 bg-slate-900/60 p-2 rounded-lg border border-slate-800/50">
                    <span className="text-slate-400 font-medium">Chuyển giao cho cán bộ:</span>
                    <strong className="text-emerald-300 flex items-center gap-1">
                      {item.assignedToName} <ArrowRight className="w-3 h-3 text-emerald-400" />
                    </strong>
                  </div>
                )}

                {/* Action Note */}
                {item.note && (
                  <p className="text-xs text-slate-300 leading-relaxed font-medium pl-1 italic">
                    "{item.note}"
                  </p>
                )}

                {/* Metadata Details (e.g. Royalty score, approval notes) */}
                {item.metadata && item.metadata.royaltyScore && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs font-extrabold text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded-md border border-amber-800/50">
                      Nhuận bút: {item.metadata.royaltyScore} điểm
                    </span>
                    {item.metadata.royaltyNotes && (
                      <span className="text-xs text-slate-400">({item.metadata.royaltyNotes})</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
