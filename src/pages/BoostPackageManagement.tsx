import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, Plus, Pencil, Trash2, Zap, ArrowLeft } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface BoostPackage {
    id: string;
    name: string;
    description: string;
    price: number;
    priority_boost: number;
    duration_days: number;
    is_featured: boolean;
    is_active: boolean;
    created_at: string;
}

const BoostPackageManagement = () => {
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();

    const [packages, setPackages] = useState<BoostPackage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        priority_boost: '',
        duration_days: '',
        is_featured: false,
        is_active: true,
    });

    // Fetch packages
    const fetchPackages = async () => {
        try {
            const { data, error } = await (supabase as any)
                .from('boost_packages')
                .select('*')
                .order('price', { ascending: true });

            if (error) throw error;
            setPackages(data || []);
        } catch (error) {
            console.error('Error fetching packages:', error);
            toast({
                title: 'Error',
                description: 'Failed to load boost packages',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!user || !isAdmin) {
            navigate('/');
            return;
        }
        fetchPackages();
    }, [user, isAdmin, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const packageData = {
                name: formData.name,
                description: formData.description,
                price: Number(formData.price),
                priority_boost: Number(formData.priority_boost),
                duration_days: Number(formData.duration_days),
                is_featured: formData.is_featured,
                is_active: formData.is_active,
            };

            if (editingId) {
                const { error } = await (supabase as any)
                    .from('boost_packages')
                    .update(packageData)
                    .eq('id', editingId);

                if (error) throw error;
                toast({ title: 'Success', description: 'Package updated successfully' });
            } else {
                const { error } = await (supabase as any)
                    .from('boost_packages')
                    .insert(packageData);

                if (error) throw error;
                toast({ title: 'Success', description: 'Package created successfully' });
            }

            setEditingId(null);
            setFormData({
                name: '',
                description: '',
                price: '',
                priority_boost: '',
                duration_days: '',
                is_featured: false,
                is_active: true,
            });
            fetchPackages();
        } catch (error: any) {
            console.error('Error saving package:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to save package',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (pkg: BoostPackage) => {
        setEditingId(pkg.id);
        setFormData({
            name: pkg.name,
            description: pkg.description,
            price: String(pkg.price),
            priority_boost: String(pkg.priority_boost),
            duration_days: String(pkg.duration_days),
            is_featured: pkg.is_featured,
            is_active: pkg.is_active,
        });
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this package?')) return;

        try {
            const { error } = await (supabase as any)
                .from('boost_packages')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast({ title: 'Deleted', description: 'Package deleted successfully' });
            fetchPackages();
        } catch (error: any) {
            console.error('Error deleting package:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to delete package',
                variant: 'destructive',
            });
        }
    };

    if (!user || !isAdmin) return null;

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="container mx-auto px-4 pt-24 pb-12">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <Zap className="w-8 h-8 text-purple-600" />
                            <h1 className="text-3xl font-bold text-foreground">Boost Package Management</h1>
                        </div>
                        <Button variant="outline" onClick={() => navigate('/admin')}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Form */}
                        <Card className="p-6 h-fit">
                            <h2 className="text-xl font-semibold mb-4 text-foreground">
                                {editingId ? 'Edit Package' : 'Create Package'}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label>Package Name</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Basic, Premium, Featured"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label>Description</Label>
                                    <Textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="e.g. Priority +5 for 14 days"
                                        rows={2}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Price (₹)</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            placeholder="99"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label>Duration (Days)</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={formData.duration_days}
                                            onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                                            placeholder="7"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label>Priority Boost</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={formData.priority_boost}
                                        onChange={(e) => setFormData({ ...formData, priority_boost: e.target.value })}
                                        placeholder="5"
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Higher priority = more visibility in listings
                                    </p>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Featured Badge</Label>
                                        <p className="text-xs text-muted-foreground">Show "Featured" badge on listing</p>
                                    </div>
                                    <Switch
                                        checked={formData.is_featured}
                                        onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Active</Label>
                                        <p className="text-xs text-muted-foreground">Users can purchase this package</p>
                                    </div>
                                    <Switch
                                        checked={formData.is_active}
                                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <Button type="submit" disabled={saving} className="bg-purple-600 hover:bg-purple-700">
                                        {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                        {editingId ? 'Update' : 'Create'} Package
                                    </Button>
                                    {editingId && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setEditingId(null);
                                                setFormData({
                                                    name: '',
                                                    description: '',
                                                    price: '',
                                                    priority_boost: '',
                                                    duration_days: '',
                                                    is_featured: false,
                                                    is_active: true,
                                                });
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </Card>

                        {/* List */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-foreground">Existing Packages</h2>
                            {isLoading ? (
                                <div className="flex justify-center p-8">
                                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                                </div>
                            ) : packages.length === 0 ? (
                                <Card className="p-8 text-center">
                                    <p className="text-muted-foreground">No boost packages yet. Create your first one!</p>
                                </Card>
                            ) : (
                                packages.map((pkg) => (
                                    <Card key={pkg.id} className={`p-4 ${pkg.is_featured ? 'border-amber-300 bg-amber-50/50' : ''}`}>
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="font-semibold text-foreground flex items-center gap-2">
                                                    {pkg.is_featured && <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />}
                                                    {pkg.name}
                                                    {!pkg.is_active && (
                                                        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                                                            Inactive
                                                        </span>
                                                    )}
                                                </h3>
                                                <p className="text-2xl font-bold text-purple-600">₹{pkg.price}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="icon" variant="outline" onClick={() => handleEdit(pkg)}>
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    onClick={() => handleDelete(pkg.id)}
                                                    className="text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-2">{pkg.description}</p>
                                        <div className="flex gap-4 text-xs text-muted-foreground">
                                            <span>Priority: +{pkg.priority_boost}</span>
                                            <span>Duration: {pkg.duration_days} days</span>
                                        </div>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BoostPackageManagement;
