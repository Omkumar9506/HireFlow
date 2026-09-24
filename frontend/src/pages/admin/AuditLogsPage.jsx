import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card, Skeleton, EmptyState } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FileSpreadsheet, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';

export const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await api.get(`/admin/audit-logs?page=${page}&limit=15`);
      setLogs(res.data.data.items || []);
      setPagination(res.data.data.pagination || {});
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Security & System Audit Trail
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Immutable log of platform transactions, role changes, verification events, and status updates.
        </p>
      </div>

      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <EmptyState
            icon={FileSpreadsheet}
            title="No audit entries recorded yet"
            description="System operations and state transitions will be recorded here automatically."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Action</th>
                  <th className="py-3 px-4 font-semibold">Entity</th>
                  <th className="py-3 px-4 font-semibold">Actor / User</th>
                  <th className="py-3 px-4 font-semibold">IP Address</th>
                  <th className="py-3 px-4 text-right font-semibold">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-blue-700">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {log.entity} <span className="text-slate-400">({log.entityId ? log.entityId.slice(-6) : '-'})</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-sans">
                      {log.userId?.name || log.userId?.email || 'System'}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500 font-sans">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasPrevPage}
            onClick={() => fetchLogs(pagination.page - 1)}
            icon={ChevronLeft}
          >
            Previous
          </Button>
          <span className="text-xs text-slate-500">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasNextPage}
            onClick={() => fetchLogs(pagination.page + 1)}
          >
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
};
