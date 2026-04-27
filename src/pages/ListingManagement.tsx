import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  Search, ArrowLeft, Loader2, Package, Eye, CheckCircle, XCircle,
  ToggleLeft, ToggleRight, Trash2, ArrowUp, ArrowDown, ArrowUpDown,
  ExternalLink,
} from 'lucide-react';

type StatusFilter = 'all' | 'approved' | 'pending' | 'rejected';
type SortKey = 'created_at' | 'rent_price' | 'views' | 'product_name';
type SortDir = 'asc' | 'desc';

const PAGE_SIZES = [25, 50, 100];

interface ListingRow {
  id: string;
  display_id: string | null;
  product_name: string;
  description: string;
  category: string;
  images: string[] | null;
  rent_price: number;
  pin_code: string;
  listing_status: string;
  listing_type: string;
  availability: boolean;
  payment_verified: boolean;
  views: number;
  product_type: string;
  created_at: string;
  owner_user_id: string;
  final_price: number;
  phone: string;
  address: string;
  owner_name: string;
  owner_email: string;
}

const statusColors: Record<string, string> = {
  approved: 'bg-green-500/10 text-green-600 border-green-500/30',
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  rejected: 'bg-red-500/10 text-red-600 border-red-500/30',
};

const ListingManagement = () => {
  const { user, isAdmin, authReady } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ListingRow | null>(null);
  const [bulkAction, setBulkAction] = useState<string | null>(null);

  useEffect(() => {
    if (!authReady) return;
    if (!user || !isAdmin) { navigate('/'); return; }
    fetchListings();
  }, [authReady, user, isAdmin, navigate]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      // Fetch listings with owner profile name
      const { data, error } = await supabase
        .from('listings')
        .select('id, display_id, product_name, description, category, images, rent_price, pin_code, listing_status, listing_type, availability, payment_verified, views, product_type, created_at, owner_user_id, final_price, phone, address, profiles:owner_user_id(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;

      // Fetch user emails via admin RPC
      let emailMap = new Map<string, string>();
      try {
        const { data: users } = await (supabase.rpc as any)('admin_get_all_users');
        if (Array.isArray(users)) {
          users.forEach((u: any) => emailMap.set(u.id, u.email || ''));
        }
      } catch { /* RPC may not exist — skip */ }

      const mapped = (data || []).map((l: any) => ({
        ...l,
        owner_name: l.profiles?.name || 'Unknown',
        owner_email: emailMap.get(l.owner_user_id) || '',
        profiles: undefined,
      })) as ListingRow[];
      setListings(mapped);
    } catch (err: any) {
      toast({ title: 'Failed to load listings', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'approve' | 'reject' | 'activate' | 'deactivate') => {
    setActionLoading(id);
    try {
      let update: any = {};
      if (action === 'approve') update = { listing_status: 'approved', payment_verified: true };
      else if (action === 'reject') update = { listing_status: 'rejected' };
      else if (action === 'activate') update = { availability: true };
      else if (action === 'deactivate') update = { availability: false };

      const { error } = await supabase.from('listings').update(update).eq('id', id);
      if (error) throw error;

      await supabase.from('admin_activity_logs').insert({
        admin_id: user?.id, action: action.toUpperCase() + '_LISTING',
        target_type: 'listing', target_id: id,
        details: { timestamp: new Date().toISOString() },
      });

      toast({ title: `Listing ${action}d successfully` });
      await fetchListings();
    } catch (err: any) {
      toast({ title: 'Action failed', description: err.message, variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(deleteTarget.id);
    try {
      const { error } = await supabase.from('listings').delete().eq('id', deleteTarget.id);
      if (error) throw error;
      toast({ title: 'Listing deleted permanently' });
      setDeleteTarget(null);
      await fetchListings();
    } catch (err: any) {
      toast({ title: 'Delete failed', description: err.message, variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedIds.size === 0) return;
    setActionLoading('bulk');
    try {
      const ids = Array.from(selectedIds);
      let update: any = {};
      if (bulkAction === 'approve') update = { listing_status: 'approved', payment_verified: true };
      else if (bulkAction === 'reject') update = { listing_status: 'rejected' };
      else if (bulkAction === 'deactivate') update = { availability: false };
      else if (bulkAction === 'activate') update = { availability: true };

      const { error } = await supabase.from('listings').update(update).in('id', ids);
      if (error) throw error;

      toast({ title: `${bulkAction} applied to ${ids.length} listings` });
      setSelectedIds(new Set());
      setBulkAction(null);
      await fetchListings();
    } catch (err: any) {
      toast({ title: 'Bulk action failed', description: err.message, variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let base = listings;
    if (statusFilter !== 'all') base = base.filter(l => l.listing_status === statusFilter);
    if (q) {
      base = base.filter(l =>
        l.product_name?.toLowerCase().includes(q) ||
        l.category?.toLowerCase().includes(q) ||
        l.pin_code?.includes(q) ||
        l.id.toLowerCase().includes(q) ||
        l.owner_name?.toLowerCase().includes(q) ||
        l.owner_email?.toLowerCase().includes(q)
      );
    }
    const arr = [...base];
    const dir = sortDir === 'asc' ? 1 : -1;
    arr.sort((a, b) => {
      let av: any, bv: any;
      switch (sortKey) {
        case 'product_name': av = (a.product_name || '').toLowerCase(); bv = (b.product_name || '').toLowerCase(); return av < bv ? -1 * dir : av > bv ? 1 * dir : 0;
        case 'rent_price': return ((a.rent_price || 0) - (b.rent_price || 0)) * dir;
        case 'views': return ((a.views || 0) - (b.views || 0)) * dir;
        default: av = a.created_at ? new Date(a.created_at).getTime() : 0; bv = b.created_at ? new Date(b.created_at).getTime() : 0; return (av - bv) * dir;
      }
    });
    return arr;
  }, [listings, search, statusFilter, sortKey, sortDir]);

  useEffect(() => { setPage(1); }, [search, statusFilter, sortKey, sortDir, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const allPageSelected = paginated.length > 0 && paginated.every(l => selectedIds.has(l.id));
  const somePageSelected = paginated.some(l => selectedIds.has(l.id)) && !allPageSelected;

  const toggleOne = (id: string, checked: boolean) => {
    setSelectedIds(prev => { const n = new Set(prev); checked ? n.add(id) : n.delete(id); return n; });
  };
  const toggleAllPage = (checked: boolean) => {
    setSelectedIds(prev => { const n = new Set(prev); paginated.forEach(l => checked ? n.add(l.id) : n.delete(l.id)); return n; });
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir(key === 'product_name' ? 'asc' : 'desc'); }
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ArrowUpDown className="w-3 h-3 opacity-50" />;
    return sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />;
  };

  const counts = useMemo(() => ({
    all: listings.length,
    approved: listings.filter(l => l.listing_status === 'approved').length,
    pending: listings.filter(l => l.listing_status === 'pending').length,
    rejected: listings.filter(l => l.listing_status === 'rejected').length,
  }), [listings]);

  if (!authReady) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 sm:pt-28 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                <Package className="w-7 h-7 text-primary" />
                All Listings
              </h1>
              <p className="text-sm text-muted-foreground">{listings.length} total listings</p>
            </div>
          </div>
        </div>

        {/* Stats mini-bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {(['all', 'approved', 'pending', 'rejected'] as StatusFilter[]).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`p-3 rounded-xl border text-left transition-all ${statusFilter === s ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : 'border-border/50 hover:border-border'}`}>
              <p className="text-2xl font-black">{counts[s]}</p>
              <p className="text-xs text-muted-foreground capitalize">{s === 'all' ? 'Total' : s}</p>
            </button>
          ))}
        </div>

        {/* Search + filter */}
        <Card className="p-4 mb-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, category, PIN code, or ID..." className="pl-10 h-11" />
            </div>
            <Select value={statusFilter} onValueChange={v => setStatusFilter(v as StatusFilter)}>
              <SelectTrigger className="h-11 w-full sm:w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Bulk action bar */}
        {selectedIds.size > 0 && (
          <Card className="p-3 mb-4 bg-primary/5 border-primary/30 flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm font-medium">{selectedIds.size} listing{selectedIds.size > 1 ? 's' : ''} selected</p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => setSelectedIds(new Set())}>Clear</Button>
              <Button size="sm" variant="outline" className="text-green-600" onClick={() => setBulkAction('approve')}>
                <CheckCircle className="w-4 h-4" /> Approve
              </Button>
              <Button size="sm" variant="outline" className="text-amber-600" onClick={() => setBulkAction('deactivate')}>
                <ToggleLeft className="w-4 h-4" /> Deactivate
              </Button>
              <Button size="sm" variant="destructive" onClick={() => setBulkAction('reject')}>
                <XCircle className="w-4 h-4" /> Reject
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
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No listings found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox checked={allPageSelected ? true : somePageSelected ? 'indeterminate' : false}
                        onCheckedChange={c => toggleAllPage(!!c)} />
                    </TableHead>
                    <TableHead>Image</TableHead>
                    <TableHead>
                      <button type="button" onClick={() => toggleSort('product_name')}
                        className="inline-flex items-center gap-1 hover:text-foreground">
                        Name <SortIcon k="product_name" />
                      </button>
                    </TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>
                      <button type="button" onClick={() => toggleSort('rent_price')}
                        className="inline-flex items-center gap-1 hover:text-foreground">
                        Price <SortIcon k="rent_price" />
                      </button>
                    </TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>
                      <button type="button" onClick={() => toggleSort('views')}
                        className="inline-flex items-center gap-1 hover:text-foreground">
                        Views <SortIcon k="views" />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button type="button" onClick={() => toggleSort('created_at')}
                        className="inline-flex items-center gap-1 hover:text-foreground">
                        Created <SortIcon k="created_at" />
                      </button>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map(l => (
                    <TableRow key={l.id} className="group">
                      <TableCell>
                        <Checkbox checked={selectedIds.has(l.id)}
                          onCheckedChange={c => toggleOne(l.id, !!c)} />
                      </TableCell>
                      <TableCell>
                        <img src={l.images?.[0] || '/placeholder.svg'} alt={l.product_name}
                          className="w-12 h-12 rounded-lg object-cover border border-border" />
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-sm line-clamp-1 max-w-[200px]">{l.product_name}</p>
                        <p className="text-xs text-muted-foreground">📍 {l.pin_code}</p>
                      </TableCell>
                      <TableCell><span className="text-xs">{l.category || '—'}</span></TableCell>
                      <TableCell>
                        <span className="font-semibold text-sm">₹{l.rent_price || 0}</span>
                        <span className="text-xs text-muted-foreground">{l.product_type === 'sale' ? '' : '/day'}</span>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium line-clamp-1 max-w-[150px]">{l.owner_name}</p>
                        {l.owner_email && (
                          <p className="text-xs text-muted-foreground line-clamp-1 max-w-[150px]">{l.owner_email}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[l.listing_status] || ''}>
                          {l.listing_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {l.availability ? (
                          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">Active</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/30">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell><span className="text-sm">{l.views || 0}</span></TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {new Date(l.created_at).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8"
                            onClick={() => window.open(`/listings/${l.display_id || l.id}`, '_blank')}
                            title="View listing">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          {l.listing_status !== 'approved' && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600"
                              disabled={actionLoading === l.id}
                              onClick={() => handleAction(l.id, 'approve')} title="Approve">
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          {l.listing_status !== 'rejected' && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600"
                              disabled={actionLoading === l.id}
                              onClick={() => handleAction(l.id, 'reject')} title="Reject">
                              <XCircle className="w-4 h-4" />
                            </Button>
                          )}
                          {l.availability ? (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500"
                              disabled={actionLoading === l.id}
                              onClick={() => handleAction(l.id, 'deactivate')} title="Deactivate">
                              <ToggleLeft className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-green-500"
                              disabled={actionLoading === l.id}
                              onClick={() => handleAction(l.id, 'activate')} title="Activate">
                              <ToggleRight className="w-4 h-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500"
                            onClick={() => setDeleteTarget(l)} title="Delete">
                            <Trash2 className="w-4 h-4" />
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

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
            <p className="text-sm text-muted-foreground">
              Showing {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <Select value={String(pageSize)} onValueChange={v => setPageSize(Number(v))}>
                <SelectTrigger className="h-9 w-[80px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map(s => <SelectItem key={s} value={String(s)}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" disabled={safePage <= 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
              <span className="text-sm">{safePage} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={safePage >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        )}

        {/* Delete confirmation */}
        <AlertDialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete listing permanently?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete "{deleteTarget?.product_name}". This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Bulk action confirmation */}
        <AlertDialog open={!!bulkAction} onOpenChange={o => !o && setBulkAction(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm bulk {bulkAction}?</AlertDialogTitle>
              <AlertDialogDescription>
                This will {bulkAction} {selectedIds.size} listing{selectedIds.size > 1 ? 's' : ''}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleBulkAction}>Confirm</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default ListingManagement;
