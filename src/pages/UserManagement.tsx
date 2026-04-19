import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  Search,
  Users as UsersIcon,
  ArrowLeft,
  Loader2,
  Shield,
  User as UserIcon,
  Pencil,
  Trash2,
  Plus,
  Minus,
  ShieldOff,
  Package,
  Eye,
  Download,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from 'lucide-react';

type SortKey = 'name' | 'streak' | 'created_at' | 'last_active_at';
type SortDir = 'asc' | 'desc';
type QuickFilter = 'all' | 'admins' | 'active_7d' | 'inactive_30d';

const PAGE_SIZE_OPTIONS = [25, 50, 100, 200];

interface UserRow {
  id: string;
  name: string;
  phone: string;
  pin_code: string;
  email: string | null;
  avatar_url: string | null;
  current_streak: number | null;
  longest_streak: number | null;
  last_active_at: string | null;
  created_at: string;
  is_admin: boolean;
}

interface UserStats {
  listings_count: number;
  total_views: number;
}

const UserManagement = () => {
  const { user, isAdmin, authReady } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [selected, setSelected] = useState<UserRow | null>(null);
  const [selectedStats, setSelectedStats] = useState<UserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [deleting, setDeleting] = useState<UserRow | null>(null);
  const [saving, setSaving] = useState(false);

  // Bulk-selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkPromoteOpen, setBulkPromoteOpen] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Sorting state
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // Edit form state
  const [form, setForm] = useState({
    name: '',
    phone: '',
    pin_code: '',
    avatar_url: '',
    current_streak: 0,
    longest_streak: 0,
  });

  useEffect(() => {
    if (!authReady) return;
    if (!user || !isAdmin) {
      navigate('/');
      return;
    }
    fetchUsers();
  }, [authReady, user, isAdmin, navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase.rpc as any)('admin_get_all_users');
      if (error) throw error;
      setUsers((data || []) as UserRow[]);
    } catch (err: any) {
      console.error(err);
      toast({
        title: 'Failed to load users',
        description: err.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats whenever a user is selected
  useEffect(() => {
    if (!selected) {
      setSelectedStats(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setStatsLoading(true);
      setSelectedStats(null);
      try {
        const { data, error } = await (supabase.rpc as any)('admin_get_user_stats', {
          _user_id: selected.id,
        });
        if (error) throw error;
        if (!cancelled) {
          const row = Array.isArray(data) ? data[0] : data;
          setSelectedStats({
            listings_count: Number(row?.listings_count ?? 0),
            total_views: Number(row?.total_views ?? 0),
          });
        }
      } catch (err: any) {
        console.error('stats error', err);
        if (!cancelled) setSelectedStats({ listings_count: 0, total_views: 0 });
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selected]);

  const openEdit = (u: UserRow) => {
    setEditing(u);
    setForm({
      name: u.name || '',
      phone: u.phone || '',
      pin_code: u.pin_code || '',
      avatar_url: u.avatar_url || '',
      current_streak: u.current_streak ?? 0,
      longest_streak: u.longest_streak ?? 0,
    });
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const { error } = await (supabase.rpc as any)('admin_update_user', {
        _user_id: editing.id,
        _name: form.name,
        _phone: form.phone,
        _pin_code: form.pin_code,
        _avatar_url: form.avatar_url || null,
        _current_streak: form.current_streak,
        _longest_streak: Math.max(form.longest_streak, form.current_streak),
      });
      if (error) throw error;
      toast({ title: 'User updated successfully' });
      setEditing(null);
      setSelected(null);
      await fetchUsers();
    } catch (err: any) {
      toast({
        title: 'Update failed',
        description: err.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setSaving(true);
    try {
      const { error } = await (supabase.rpc as any)('admin_delete_user', {
        _user_id: deleting.id,
      });
      if (error) throw error;
      toast({ title: 'User deleted permanently' });
      setDeleting(null);
      setSelected(null);
      await fetchUsers();
    } catch (err: any) {
      toast({
        title: 'Delete failed',
        description: err.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAdmin = async (u: UserRow) => {
    try {
      const { error } = await (supabase.rpc as any)('admin_toggle_admin_role', {
        _user_id: u.id,
        _make_admin: !u.is_admin,
      });
      if (error) throw error;
      toast({
        title: u.is_admin ? 'Admin role revoked' : 'User promoted to admin',
      });
      await fetchUsers();
      setSelected((prev) => (prev ? { ...prev, is_admin: !u.is_admin } : prev));
    } catch (err: any) {
      toast({
        title: 'Action failed',
        description: err.message || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const adjustStreak = (delta: number) => {
    setForm((f) => {
      const next = Math.max(0, f.current_streak + delta);
      return {
        ...f,
        current_streak: next,
        longest_streak: Math.max(f.longest_streak, next),
      };
    });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = !q
      ? users
      : users.filter(
          (u) =>
            u.name?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q) ||
            u.phone?.toLowerCase().includes(q) ||
            u.id.toLowerCase().includes(q) ||
            u.pin_code?.toLowerCase().includes(q),
        );

    const arr = [...base];
    const dir = sortDir === 'asc' ? 1 : -1;
    arr.sort((a, b) => {
      let av: any;
      let bv: any;
      switch (sortKey) {
        case 'name':
          av = (a.name || '').toLowerCase();
          bv = (b.name || '').toLowerCase();
          return av < bv ? -1 * dir : av > bv ? 1 * dir : 0;
        case 'streak':
          av = a.current_streak ?? 0;
          bv = b.current_streak ?? 0;
          return (av - bv) * dir;
        case 'created_at':
          av = a.created_at ? new Date(a.created_at).getTime() : 0;
          bv = b.created_at ? new Date(b.created_at).getTime() : 0;
          return (av - bv) * dir;
        case 'last_active_at':
          av = a.last_active_at ? new Date(a.last_active_at).getTime() : 0;
          bv = b.last_active_at ? new Date(b.last_active_at).getTime() : 0;
          return (av - bv) * dir;
      }
    });
    return arr;
  }, [users, search, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'name' ? 'asc' : 'desc');
    }
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ArrowUpDown className="w-3 h-3 opacity-50" />;
    return sortDir === 'asc' ? (
      <ArrowUp className="w-3 h-3" />
    ) : (
      <ArrowDown className="w-3 h-3" />
    );
  };

  // Bulk-selection helpers
  const selectableFiltered = filtered.filter((u) => u.id !== user?.id);
  const allFilteredSelected =
    selectableFiltered.length > 0 &&
    selectableFiltered.every((u) => selectedIds.has(u.id));
  const someFilteredSelected =
    selectableFiltered.some((u) => selectedIds.has(u.id)) && !allFilteredSelected;

  const toggleOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const toggleAllVisible = (checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        selectableFiltered.forEach((u) => next.add(u.id));
      } else {
        selectableFiltered.forEach((u) => next.delete(u.id));
      }
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkDelete = async () => {
    setBulkBusy(true);
    try {
      const ids = Array.from(selectedIds).filter((id) => id !== user?.id);
      const { data, error } = await (supabase.rpc as any)('admin_bulk_delete_users', {
        _user_ids: ids,
      });
      if (error) throw error;
      toast({ title: `Deleted ${data ?? ids.length} users` });
      clearSelection();
      setBulkDeleteOpen(false);
      await fetchUsers();
    } catch (err: any) {
      toast({
        title: 'Bulk delete failed',
        description: err.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setBulkBusy(false);
    }
  };

  const handleBulkPromote = async (makeAdmin: boolean) => {
    setBulkBusy(true);
    try {
      const ids = Array.from(selectedIds);
      const { data, error } = await (supabase.rpc as any)('admin_bulk_toggle_admin', {
        _user_ids: ids,
        _make_admin: makeAdmin,
      });
      if (error) throw error;
      toast({
        title: makeAdmin
          ? `Promoted ${data ?? ids.length} users to admin`
          : `Revoked admin from ${data ?? ids.length} users`,
      });
      clearSelection();
      setBulkPromoteOpen(false);
      await fetchUsers();
    } catch (err: any) {
      toast({
        title: 'Bulk action failed',
        description: err.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setBulkBusy(false);
    }
  };

  const handleExportCsv = async (mode: 'all' | 'selected') => {
    setExporting(true);
    try {
      const target =
        mode === 'selected'
          ? users.filter((u) => selectedIds.has(u.id))
          : filtered;

      if (target.length === 0) {
        toast({ title: 'Nothing to export', variant: 'destructive' });
        return;
      }

      // Fetch stats for each user in parallel (batched)
      const stats = new Map<string, UserStats>();
      const batchSize = 8;
      for (let i = 0; i < target.length; i += batchSize) {
        const chunk = target.slice(i, i + batchSize);
        const results = await Promise.all(
          chunk.map(async (u) => {
            try {
              const { data } = await (supabase.rpc as any)('admin_get_user_stats', {
                _user_id: u.id,
              });
              const row = Array.isArray(data) ? data[0] : data;
              return [
                u.id,
                {
                  listings_count: Number(row?.listings_count ?? 0),
                  total_views: Number(row?.total_views ?? 0),
                },
              ] as const;
            } catch {
              return [u.id, { listings_count: 0, total_views: 0 }] as const;
            }
          }),
        );
        results.forEach(([id, s]) => stats.set(id, s));
      }

      const escape = (val: unknown) => {
        if (val === null || val === undefined) return '';
        const s = String(val).replace(/"/g, '""');
        return /[",\n]/.test(s) ? `"${s}"` : s;
      };

      const headers = [
        'id',
        'name',
        'email',
        'phone',
        'pin_code',
        'is_admin',
        'current_streak',
        'longest_streak',
        'listings_count',
        'total_views',
        'last_active_at',
        'created_at',
      ];

      const rows = target.map((u) => {
        const s = stats.get(u.id) || { listings_count: 0, total_views: 0 };
        return [
          u.id,
          u.name,
          u.email,
          u.phone,
          u.pin_code,
          u.is_admin ? 'yes' : 'no',
          u.current_streak ?? 0,
          u.longest_streak ?? 0,
          s.listings_count,
          s.total_views,
          u.last_active_at || '',
          u.created_at || '',
        ]
          .map(escape)
          .join(',');
      });

      const csv = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const stamp = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `users_${mode}_${stamp}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({ title: `Exported ${target.length} users to CSV` });
    } catch (err: any) {
      toast({
        title: 'Export failed',
        description: err.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  const initials = (name: string) =>
    name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U';

  if (!authReady) return null;

  const selectionCount = selectedIds.size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 sm:pt-28 pb-20">
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                <UsersIcon className="w-7 h-7 text-primary" />
                User Management
              </h1>
              <p className="text-sm text-muted-foreground">
                {users.length} total users · Click a row to view, edit or delete
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportCsv('all')}
              disabled={exporting || loading || filtered.length === 0}
            >
              {exporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Export {search ? 'filtered' : 'all'} CSV
            </Button>
            {selectionCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportCsv('selected')}
                disabled={exporting}
              >
                <Download className="w-4 h-4" />
                Export selected ({selectionCount})
              </Button>
            )}
          </div>
        </div>

        {/* Search bar */}
        <Card className="p-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone, user ID, or PIN code..."
              className="pl-10 h-11"
            />
          </div>
          {search && (
            <p className="text-xs text-muted-foreground mt-2">
              Found {filtered.length} of {users.length} users
            </p>
          )}
        </Card>

        {/* Bulk action bar */}
        {selectionCount > 0 && (
          <Card className="p-3 mb-4 bg-primary/5 border-primary/30 flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm font-medium">
              {selectionCount} user{selectionCount > 1 ? 's' : ''} selected
            </p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={clearSelection}>
                Clear
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setBulkPromoteOpen(true)}
              >
                <Shield className="w-4 h-4" /> Bulk Role…
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setBulkDeleteOpen(true)}
              >
                <Trash2 className="w-4 h-4" /> Delete Selected
              </Button>
            </div>
          </Card>
        )}

        {/* Table */}
        <Card className="overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <UsersIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={
                          allFilteredSelected
                            ? true
                            : someFilteredSelected
                              ? 'indeterminate'
                              : false
                        }
                        onCheckedChange={(c) => toggleAllVisible(!!c)}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead>
                      <button
                        type="button"
                        onClick={() => toggleSort('name')}
                        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        User <SortIcon k="name" />
                      </button>
                    </TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>PIN</TableHead>
                    <TableHead>
                      <button
                        type="button"
                        onClick={() => toggleSort('streak')}
                        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        Streak <SortIcon k="streak" />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        type="button"
                        onClick={() => toggleSort('created_at')}
                        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        Joined <SortIcon k="created_at" />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        type="button"
                        onClick={() => toggleSort('last_active_at')}
                        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        Last Active <SortIcon k="last_active_at" />
                      </button>
                    </TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((u) => {
                    const isSelf = u.id === user?.id;
                    const isChecked = selectedIds.has(u.id);
                    return (
                      <TableRow
                        key={u.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelected(u)}
                        data-state={isChecked ? 'selected' : undefined}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={isChecked}
                            disabled={isSelf}
                            onCheckedChange={(c) => toggleOne(u.id, !!c)}
                            aria-label={`Select ${u.name}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-9 h-9">
                              <AvatarImage src={u.avatar_url || undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {initials(u.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{u.name || '—'}</p>
                              <p className="text-xs text-muted-foreground font-mono">
                                {u.id.slice(0, 8)}…
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{u.email || '—'}</TableCell>
                        <TableCell className="text-sm">{u.phone || '—'}</TableCell>
                        <TableCell className="text-sm">{u.pin_code || '—'}</TableCell>
                        <TableCell className="text-sm">{u.current_streak ?? 0}🔥</TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {u.created_at
                            ? new Date(u.created_at).toLocaleDateString()
                            : '—'}
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {u.last_active_at
                            ? new Date(u.last_active_at).toLocaleDateString()
                            : '—'}
                        </TableCell>
                        <TableCell>
                          {u.is_admin ? (
                            <Badge className="bg-primary/10 text-primary border-primary/20" variant="outline">
                              <Shield className="w-3 h-3 mr-1" /> Admin
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              <UserIcon className="w-3 h-3 mr-1" /> User
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openEdit(u)}
                              title="Edit user"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setDeleting(u)}
                              title="Delete user"
                              disabled={isSelf}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={selected.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {initials(selected.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-bold">{selected.name}</h3>
                  {selected.is_admin && (
                    <Badge className="bg-primary/10 text-primary border-primary/20" variant="outline">
                      <Shield className="w-3 h-3 mr-1" /> Admin
                    </Badge>
                  )}
                </div>
              </div>

              {/* Listings stats */}
              <div className="grid grid-cols-2 gap-3">
                <Card className="p-3 bg-primary/5 border-primary/20">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Package className="w-3.5 h-3.5" /> Listings
                  </div>
                  <p className="text-2xl font-bold mt-1">
                    {statsLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      (selectedStats?.listings_count ?? 0)
                    )}
                  </p>
                </Card>
                <Card className="p-3 bg-primary/5 border-primary/20">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Eye className="w-3.5 h-3.5" /> Total Views
                  </div>
                  <p className="text-2xl font-bold mt-1">
                    {statsLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      (selectedStats?.total_views ?? 0).toLocaleString()
                    )}
                  </p>
                </Card>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">User ID</p>
                  <p className="font-mono text-xs break-all">{selected.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Email</p>
                  <p className="break-all">{selected.email || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Phone</p>
                  <p>{selected.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">PIN Code</p>
                  <p>{selected.pin_code || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Current Streak</p>
                  <p>{selected.current_streak ?? 0} 🔥</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Longest Streak</p>
                  <p>{selected.longest_streak ?? 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Joined</p>
                  <p>{new Date(selected.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Last Active</p>
                  <p>
                    {selected.last_active_at
                      ? new Date(selected.last_active_at).toLocaleString()
                      : 'Never'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-3 border-t">
                <Button variant="outline" onClick={() => openEdit(selected)}>
                  <Pencil className="w-4 h-4" /> Edit
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleToggleAdmin(selected)}
                  disabled={selected.id === user?.id && selected.is_admin}
                >
                  {selected.is_admin ? (
                    <>
                      <ShieldOff className="w-4 h-4" /> Revoke Admin
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" /> Make Admin
                    </>
                  )}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setDeleting(selected)}
                  disabled={selected.id === user?.id}
                  className="ml-auto"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  maxLength={100}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })
                    }
                    placeholder="10-digit phone"
                  />
                </div>
                <div className="space-y-2">
                  <Label>PIN Code</Label>
                  <Input
                    value={form.pin_code}
                    onChange={(e) =>
                      setForm({ ...form, pin_code: e.target.value.replace(/\D/g, '').slice(0, 6) })
                    }
                    placeholder="6-digit PIN"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Avatar URL</Label>
                <Input
                  value={form.avatar_url}
                  onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Current Streak 🔥</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => adjustStreak(-1)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Input
                      type="number"
                      min={0}
                      value={form.current_streak}
                      onChange={(e) => {
                        const v = Math.max(0, parseInt(e.target.value || '0', 10));
                        setForm((f) => ({
                          ...f,
                          current_streak: v,
                          longest_streak: Math.max(f.longest_streak, v),
                        }));
                      }}
                      className="text-center"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => adjustStreak(1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Longest Streak</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.longest_streak}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        longest_streak: Math.max(0, parseInt(e.target.value || '0', 10)),
                      })
                    }
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Note: Email cannot be changed from here. Longest streak is auto-bumped if current
                streak exceeds it.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this user permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleting?.name}</strong> ({deleting?.email}),
              their profile, roles, and account. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={saving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk delete confirmation */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {selectionCount} user{selectionCount > 1 ? 's' : ''} permanently?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the selected accounts, profiles, and roles. Your own
              account will be skipped automatically. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkBusy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={bulkBusy}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {bulkBusy && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Delete {selectionCount} Users
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk promote/revoke dialog */}
      <Dialog open={bulkPromoteOpen} onOpenChange={setBulkPromoteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk Role Change</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Apply an admin role change to all {selectionCount} selected users. Your own account is
            skipped on revoke.
          </p>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => handleBulkPromote(false)}
              disabled={bulkBusy}
            >
              {bulkBusy ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldOff className="w-4 h-4" />
              )}
              Revoke Admin
            </Button>
            <Button onClick={() => handleBulkPromote(true)} disabled={bulkBusy}>
              {bulkBusy ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Shield className="w-4 h-4" />
              )}
              Make Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
