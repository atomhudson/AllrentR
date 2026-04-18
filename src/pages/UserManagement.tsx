import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
} from 'lucide-react';

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

const UserManagement = () => {
  const { user, isAdmin, authReady } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<UserRow | null>(null);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [deleting, setDeleting] = useState<UserRow | null>(null);
  const [saving, setSaving] = useState(false);

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
      // refresh selection
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
    if (!q) return users;
    return users.filter((u) => {
      return (
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q) ||
        u.pin_code?.toLowerCase().includes(q)
      );
    });
  }, [users, search]);

  const initials = (name: string) =>
    name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U';

  if (!authReady) return null;

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
        </div>

        {/* Search bar */}
        <Card className="p-4 mb-6">
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
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>PIN</TableHead>
                    <TableHead>Streak</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((u) => (
                    <TableRow
                      key={u.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelected(u)}
                    >
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
                            disabled={u.id === user?.id}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
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
    </div>
  );
};

export default UserManagement;
