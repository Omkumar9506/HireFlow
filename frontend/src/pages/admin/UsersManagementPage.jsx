import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card, Skeleton, EmptyState } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/StatusBadge';
import { Users, Search, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';

export const UsersManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);

      const res = await api.get(`/admin/users?${params.toString()}`);
      setUsers(res.data.data.items || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const handleToggleStatus = async (userId) => {
    try {
      await api.patch(`/admin/users/${userId}/toggle-status`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle user status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            User Governance & Access Control
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit registered candidates, recruiters, and administrative accounts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Input
            icon={Search}
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-56"
          />

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg border border-slate-300 p-2 text-xs bg-white text-slate-700"
          >
            <option value="">All Roles</option>
            <option value="CANDIDATE">Candidates</option>
            <option value="RECRUITER">Recruiters</option>
            <option value="ADMIN">Administrators</option>
          </select>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No users match the criteria"
            description="Try adjusting your search query or role filter."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">User</th>
                  <th className="py-3 px-4 font-semibold">Role</th>
                  <th className="py-3 px-4 font-semibold">Verification</th>
                  <th className="py-3 px-4 font-semibold">Account Status</th>
                  <th className="py-3 px-4 font-semibold">Registered</th>
                  <th className="py-3 px-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{u.name}</p>
                      <p className="text-[11px] text-slate-500">{u.email}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          u.role === 'ADMIN'
                            ? 'danger'
                            : u.role === 'RECRUITER'
                            ? 'purple'
                            : 'primary'
                        }
                      >
                        {u.role}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      {u.isEmailVerified ? (
                        <span className="text-emerald-600 font-semibold inline-flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="text-amber-600 font-medium inline-flex items-center gap-1">
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {u.isActive ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[10px] border border-emerald-200">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-semibold text-[10px] border border-red-200">
                          Deactivated
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {u.role !== 'ADMIN' && (
                        <Button
                          variant={u.isActive ? 'ghost' : 'outline'}
                          size="sm"
                          className={u.isActive ? 'text-red-600 hover:bg-red-50 hover:text-red-700' : 'text-emerald-600'}
                          onClick={() => handleToggleStatus(u._id)}
                        >
                          {u.isActive ? 'Deactivate' : 'Reactivate'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
