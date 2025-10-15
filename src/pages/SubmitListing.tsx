import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Upload, Loader2, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ImageUpload } from '@/components/ImageUpload';

const SubmitListing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    product_name: '',
    description: '',
    images: [] as string[],
    rent_price: '',
    pin_code: '',
    payment_transaction: '',
    product_type: 'rent' as 'rent' | 'sale' | 'both',
    category: 'other',
    phone: '',
    address: '',
  });

  const [errors, setErrors] = useState({
    phone: '',
    pinCode: '',
  });

  if (!user) {
    navigate('/login');
    return null;
  }

  const validatePhone = (phone: string): boolean => {
    // Indian phone number validation: 10 digits, optionally starting with +91 or 91
    const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ''));
  };

  const validatePinCode = (pinCode: string): boolean => {
    // Indian PIN code validation: exactly 6 digits
    const pinCodeRegex = /^\d{6}$/;
    return pinCodeRegex.test(pinCode);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear errors as user types
    if (name === 'phone') {
      setErrors(prev => ({ ...prev, phone: '' }));
    }
    if (name === 'pin_code') {
      setErrors(prev => ({ ...prev, pinCode: '' }));
    }
  };

  const handleSubmitPayment = async () => {
    if (!formData.payment_transaction) {
      toast({
        title: "Payment details required",
        description: "Please enter your transaction ID or upload payment screenshot",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('listings').insert({
        owner_user_id: user.id,
        product_name: formData.product_name,
        description: formData.description,
        images: formData.images,
        rent_price: parseFloat(formData.rent_price),
        pin_code: formData.pin_code,
        payment_transaction: formData.payment_transaction,
        product_type: formData.product_type,
        category: formData.category,
        phone: formData.phone,
        address: formData.address,
      });

      if (error) throw error;

      // Log user activity
      await supabase.from('user_activity_logs').insert({
        user_id: user.id,
        action: 'SUBMIT_LISTING',
        details: {
          product_name: formData.product_name,
          category: formData.category,
          rent_price: formData.rent_price,
          timestamp: new Date().toISOString()
        }
      });

      setPaymentSubmitted(true);
      toast({
        title: "Listing submitted!",
        description: "Your listing is pending admin approval. You'll be notified once it's live.",
      });

      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "Unable to create listing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate phone number
    if (!validatePhone(formData.phone)) {
      setErrors(prev => ({ 
        ...prev, 
        phone: 'Please enter a valid 10-digit Indian phone number (e.g., +91 98765 43210 or 9876543210)' 
      }));
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid 10-digit Indian phone number",
        variant: "destructive",
      });
      return;
    }

    // Validate PIN code
    if (!validatePinCode(formData.pin_code)) {
      setErrors(prev => ({ 
        ...prev, 
        pinCode: 'Please enter a valid 6-digit PIN code' 
      }));
      toast({
        title: "Invalid PIN code",
        description: "Please enter a valid 6-digit PIN code",
        variant: "destructive",
      });
      return;
    }

    // Validate images
    if (formData.images.length < 5) {
      toast({
        title: "More images required",
        description: "Please upload at least 5 photos of your product",
        variant: "destructive",
      });
      return;
    }

    setShowPaymentDialog(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-4xl font-serif font-bold text-foreground mb-2">
              List Your Item
            </h1>
            <p className="text-muted-foreground">
              Fill in the details and start earning from your unused items
            </p>
          </div>

          <Card className="p-8 shadow-elegant animate-scale-in">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="product_name">Product Name</Label>
                <Input
                  id="product_name"
                  name="product_name"
                  type="text"
                  required
                  value={formData.product_name}
                  onChange={handleChange}
                  placeholder="e.g., Camera, Laptop, Bicycle"
                  className="transition-all duration-300 focus:shadow-card"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  required
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your item in detail..."
                  rows={4}
                  className="transition-all duration-300 focus:shadow-card resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label>Product Images (Minimum 5 Photos)</Label>
                <ImageUpload
                  userId={user.id}
                  currentImages={formData.images}
                  onImagesUploaded={(urls) => setFormData({ ...formData, images: urls })}
                  maxImages={5}
                />
                <p className="text-xs text-muted-foreground">
                  Upload at least 5 photos from different angles to showcase your product
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Product Category</Label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                  required
                >
                  <option value="electronics">Electronics</option>
                  <option value="vehicles">Vehicles</option>
                  <option value="furniture">Furniture</option>
                  <option value="tools">Tools</option>
                  <option value="sports">Sports & Fitness</option>
                  <option value="books">Books</option>
                  <option value="clothing">Clothing</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product_type">Product Type</Label>
                <select
                  id="product_type"
                  name="product_type"
                  value={formData.product_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                  required
                >
                  <option value="rent">For Rent</option>
                  <option value="sale">For Sale</option>
                  <option value="both">Both (Rent & Sale)</option>
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="rent_price">Price (₹/day)</Label>
                  <Input
                    id="rent_price"
                    name="rent_price"
                    type="number"
                    required
                    min="1"
                    value={formData.rent_price}
                    onChange={handleChange}
                    placeholder="100"
                    className="transition-all duration-300 focus:shadow-card"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pin_code">Pin Code</Label>
                  <Input
                    id="pin_code"
                    name="pin_code"
                    type="text"
                    required
                    maxLength={6}
                    value={formData.pin_code}
                    onChange={handleChange}
                    placeholder="Enter 6-digit PIN code"
                    className={`transition-all duration-300 focus:shadow-card ${errors.pinCode ? 'border-destructive' : ''}`}
                  />
                  {errors.pinCode && (
                    <p className="text-sm text-destructive">{errors.pinCode}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Contact Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210 or 9876543210"
                  className={`transition-all duration-300 focus:shadow-card ${errors.phone ? 'border-destructive' : ''}`}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone}</p>
                )}
                <p className="text-xs text-muted-foreground">Enter a valid 10-digit Indian mobile number</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your full address"
                  rows={3}
                  className="transition-all duration-300 focus:shadow-card resize-none"
                />
              </div>

              <div className="bg-accent/10 border-2 border-accent rounded-lg p-4">
                <p className="text-sm text-foreground font-medium">
                  ℹ️ A one-time listing fee of <span className="text-accent font-bold">₹10</span> is required. Your listing will go live after admin approval.
                </p>
              </div>

              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full"
              >
                Continue to Payment
              </Button>
            </form>
          </Card>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif">
              {paymentSubmitted ? 'Listing Submitted!' : 'Payment Verification'}
            </DialogTitle>
            <DialogDescription>
              {paymentSubmitted 
                ? 'Your listing is pending admin approval. You will be notified once it goes live.'
                : 'Pay ₹10 listing fee to submit your item for approval'
              }
            </DialogDescription>
          </DialogHeader>

          {paymentSubmitted ? (
            <div className="text-center py-8 space-y-4">
              <CheckCircle className="w-16 h-16 text-accent mx-auto animate-scale-in" />
              <p className="text-muted-foreground">
                Redirecting to your profile...
              </p>
            </div>
          ) : (
            <div className="space-y-6 py-4">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-foreground">UPI Payment Details:</p>
                <p className="text-xs text-muted-foreground">UPI ID: rentkaro@paytm</p>
                <p className="text-xs text-muted-foreground">Amount: ₹10</p>
                <p className="text-xs text-accent font-medium mt-2">
                  After payment, enter your transaction ID below
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_transaction">Transaction ID / Screenshot URL</Label>
                <Input
                  id="payment_transaction"
                  name="payment_transaction"
                  type="text"
                  required
                  value={formData.payment_transaction}
                  onChange={handleChange}
                  placeholder="Enter transaction ID or upload screenshot URL"
                  className="transition-all duration-300 focus:shadow-card"
                />
              </div>

              <Button
                variant="hero"
                size="lg"
                className="w-full"
                onClick={handleSubmitPayment}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Submit Listing
                  </>
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubmitListing;
