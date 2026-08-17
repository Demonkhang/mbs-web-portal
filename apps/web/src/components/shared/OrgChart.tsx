import React, { useState } from 'react';
import { ChevronDown, ChevronRight, User, Phone, Mail, Building, Users } from 'lucide-react';
import { OrgNode } from '../../lib/types';
import { MOCK_ORG_TREE } from '../../lib/mock-data';
import { cn } from '../../lib/utils';

export interface OrgChartProps {
  data?: OrgNode;
}

export const OrgChart: React.FC<OrgChartProps> = ({ data = MOCK_ORG_TREE }) => {
  return (
    <div className="w-full overflow-x-auto py-8 bg-slate-50 rounded-2xl border border-slate-200">
      <div className="min-w-[720px] flex flex-col items-center px-4">
        <OrgNodeCard node={data} isRoot />
      </div>
    </div>
  );
};

const OrgNodeCard: React.FC<{ node: OrgNode; isRoot?: boolean }> = ({ node, isRoot = false }) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="flex flex-col items-center">
      {/* Node Box */}
      <div
        className={cn(
          'relative rounded-xl border p-4 shadow-md transition-all text-center max-w-sm w-full',
          isRoot
            ? 'bg-red-800 text-white border-red-900 ring-4 ring-red-100'
            : node.leaderTitle?.includes('Trưởng Ban') || node.leaderTitle?.includes('Phó')
            ? 'bg-emerald-800 text-white border-emerald-900 ring-4 ring-emerald-100'
            : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-500'
        )}
      >
        <h4 className={cn('text-xs font-extrabold uppercase tracking-wide', isRoot ? 'text-amber-300' : 'text-emerald-300')}>
          {node.title}
        </h4>

        {node.leaderName && (
          <div className="mt-2 pt-2 border-t border-white/20">
            <div className="flex items-center justify-center gap-1.5 font-bold text-sm">
              <User className="w-3.5 h-3.5" />
              <span>{node.leaderName}</span>
            </div>
            {node.leaderTitle && (
              <span className="text-[11px] opacity-90 block italic font-normal">
                {node.leaderTitle}
              </span>
            )}
          </div>
        )}

        {node.description && (
          <p className="text-[11px] opacity-80 mt-1.5 leading-snug line-clamp-2">
            {node.description}
          </p>
        )}

        {(node.phone || node.memberCount) && (
          <div className="flex items-center justify-center gap-3 mt-2 text-[10px] opacity-80">
            {node.memberCount && (
              <span className="inline-flex items-center gap-1">
                <Users className="w-3 h-3" /> {node.memberCount} nhân sự
              </span>
            )}
            {node.phone && (
              <span className="inline-flex items-center gap-1">
                <Phone className="w-3 h-3" /> {node.phone}
              </span>
            )}
          </div>
        )}

        {hasChildren && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center justify-center shadow-xs cursor-pointer text-xs"
            title={expanded ? 'Thu gọn' : 'Mở rộng'}
          >
            {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Vertical Line Connector */}
      {hasChildren && expanded && (
        <div className="w-0.5 h-8 bg-slate-300 my-1"></div>
      )}

      {/* Children Nodes Level */}
      {hasChildren && expanded && (
        <div className="relative flex justify-center gap-6 pt-2">
          {/* Horizontal crossbar line connecting multiple siblings */}
          {node.children!.length > 1 && (
            <div className="absolute top-0 left-12 right-12 h-0.5 bg-slate-300 -translate-y-2"></div>
          )}

          {node.children!.map((child) => (
            <div key={child.id} className="relative flex flex-col items-center">
              {/* Connector from horizontal bar to child node */}
              <div className="w-0.5 h-4 bg-slate-300 mb-1"></div>
              <OrgNodeCard node={child} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
