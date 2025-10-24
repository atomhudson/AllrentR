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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Upload, Loader2, CheckCircle, Tag } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ImageUpload } from '@/components/ImageUpload';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { validateCoupon } from '@/hooks/useCoupons';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const SubmitListing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [listingType, setListingType] = useState<'free' | 'paid'>('paid');
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [formData, setFormData] = useState({
    product_name: '',
    description: '',
    images: [] as string[],
    rent_price: '',
    pin_code: '',
    product_type: 'rent' as 'rent' | 'sale' | 'both',
    category: 'other',
    phone: '',
    address: '',
  });

  const [errors, setErrors] = useState({
    phone: '',
    pinCode: '',
  });

  // Check authentication in useEffect to avoid early return before hooks
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Return null while redirecting if no user
  if (!user) {
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

  const handleApplyCoupon = async () => {
    if (!couponCode) {
      toast({
        title: 'Coupon code required',
        description: 'Please enter a coupon code',
        variant: 'destructive',
      });
      return;
    }

    setValidatingCoupon(true);
    const result = await validateCoupon(couponCode);
    
    if (result.valid && result.coupon) {
      const originalPrice = 20;
      let discountAmount = 0;
      
      if (result.coupon.is_percentage) {
        discountAmount = (originalPrice * result.coupon.discount_percentage) / 100;
      } else {
        discountAmount = result.coupon.discount_amount;
      }
      
      setDiscount(Math.min(discountAmount, originalPrice));
      setCouponApplied(true);
      toast({
        title: 'Coupon applied!',
        description: `You saved ₹${Math.min(discountAmount, originalPrice)}`,
      });
    } else {
      toast({
        title: 'Invalid coupon',
        description: result.error || 'This coupon code is not valid',
        variant: 'destructive',
      });
    }
    setValidatingCoupon(false);
  };

  useEffect(() => {
    // Load Razorpay script only if user is authenticated
    if (!user) return;
    
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [user]);

  const handleRazorpayPayment = async () => {
    setLoading(true);
    try {
      const originalPrice = 20;
      const finalPrice = originalPrice - discount;

      // Create Razorpay order via edge function
      const { data: orderData, error: orderError } = await supabase.functions.invoke('create-razorpay-order', {
        body: { 
          amount: finalPrice,
          currency: 'INR',
          receipt: `listing_${Date.now()}`
        }
      });

      if (orderError) throw orderError;

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Product Listing Payment',
        description: `Payment for listing: ${formData.product_name}`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          // Payment successful
          try {
            const { error } = await supabase.from('listings').insert({
              owner_user_id: user.id,
              product_name: formData.product_name,
              description: formData.description,
              images: formData.images,
              rent_price: parseFloat(formData.rent_price),
              pin_code: formData.pin_code,
              payment_transaction: response.razorpay_payment_id,
              product_type: formData.product_type,
              category: formData.category,
              phone: formData.phone,
              address: formData.address,
              listing_type: 'paid',
              coupon_code: couponApplied ? couponCode : null,
              original_price: originalPrice,
              discount_amount: discount,
              final_price: finalPrice,
              payment_verified: true,
            });

            if (error) throw error;

            // Increment coupon usage if applied
            if (couponApplied && couponCode) {
              await supabase.rpc('increment_coupon_usage', { coupon_code: couponCode.toUpperCase() });
            }

            // Log user activity
            await supabase.from('user_activity_logs').insert({
              user_id: user.id,
              action: 'SUBMIT_LISTING',
              details: {
                product_name: formData.product_name,
                category: formData.category,
                rent_price: formData.rent_price,
                payment_id: response.razorpay_payment_id,
                timestamp: new Date().toISOString()
              }
            });

            setPaymentSubmitted(true);
            toast({
              title: "Payment successful!",
              description: "Your listing is pending admin approval.",
            });

            setTimeout(() => {
              navigate('/profile');
            }, 2000);
          } catch (error) {
            toast({
              title: "Submission failed",
              description: "Payment successful but listing creation failed. Please contact support.",
              variant: "destructive",
            });
          }
        },
        prefill: {
          contact: formData.phone,
        },
        theme: {
          color: '#6366f1',
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            toast({
              title: "Payment cancelled",
              description: "You cancelled the payment process",
              variant: "destructive",
            });
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      setLoading(false);
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment failed",
        description: "Unable to process payment. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleDirectSubmit = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from('listings').insert({
        owner_user_id: user.id,
        product_name: formData.product_name,
        description: formData.description,
        images: formData.images,
        rent_price: parseFloat(formData.rent_price),
        pin_code: formData.pin_code,
        payment_transaction: 'FREE_LISTING',
        product_type: formData.product_type,
        category: formData.category,
        phone: formData.phone,
        address: formData.address,
        listing_type: 'free',
        original_price: 0,
        discount_amount: 0,
        final_price: 0,
      });

      if (error) throw error;

      await supabase.from('user_activity_logs').insert({
        user_id: user.id,
        action: 'SUBMIT_FREE_LISTING',
        details: {
          product_name: formData.product_name,
          category: formData.category,
          timestamp: new Date().toISOString()
        }
      });

      toast({
        title: "Free listing submitted!",
        description: "Your listing is pending admin approval.",
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

    if (formData.images.length < 5) {
      toast({
        title: "More images required",
        description: "Please upload at least 5 photos of your product",
        variant: "destructive",
      });
      return;
    }

    if (listingType === 'free') {
      handleDirectSubmit();
    } else {
      handleRazorpayPayment();
    }
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
                  placeholder="Enter Phone Number"
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

              <div className="space-y-4 bg-accent/5 border border-accent/20 rounded-lg p-6">
                <Label className="text-base font-semibold">Listing Type</Label>
                <RadioGroup value={listingType} onValueChange={(value: 'free' | 'paid') => setListingType(value)}>
                  <div className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-accent/5 transition-colors">
                    {/* <RadioGroupItem value="free" id="free" />
                    <Label htmlFor="free" className="flex-1 cursor-pointer">
                      <div className="font-semibold">Free Listing</div>
                      <div className="text-sm text-muted-foreground">No payment required</div>
                    </Label> */}
                  </div>
                  <div className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-accent/5 transition-colors">
                    <RadioGroupItem value="paid" id="paid" />
                    <Label htmlFor="paid" className="flex-1 cursor-pointer">
                      <div className="font-semibold">Paid Listing - ₹20</div>
                      <div className="text-sm text-muted-foreground">Priority listing with more visibility</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {listingType === 'paid' && (
                <div className="space-y-4 bg-primary/5 border border-primary/20 rounded-lg p-6">
                  <Label className="text-base font-semibold">Have a Coupon Code?</Label>
                  <div className="flex gap-2">
                    <Input
                      id="coupon_code"
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter coupon code"
                      disabled={couponApplied}
                      className="font-mono"
                    />
                    <Button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponApplied || validatingCoupon}
                      variant="outline"
                    >
                      {validatingCoupon ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : couponApplied ? (
                        'Applied'
                      ) : (
                        <>
                          <Tag className="mr-2 h-4 w-4" />
                          Apply
                        </>
                      )}
                    </Button>
                  </div>
                  {couponApplied && (
                    <p className="text-sm text-accent flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      Coupon applied! You saved ₹{discount.toFixed(2)}
                    </p>
                  )}
                  <div className="text-sm text-muted-foreground">
                    <p>Original Amount: <span className="line-through">₹20</span></p>
                    <p className="text-lg font-bold text-foreground">
                      Final Amount: ₹{(20 - discount).toFixed(2)}
                    </p>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                variant="premium"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : listingType === 'free' ? (
                  'Submit Free Listing'
                ) : (
                  'Continue to Payment'
                )}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SubmitListing;
