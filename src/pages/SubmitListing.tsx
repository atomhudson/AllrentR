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
import { Loader2, CheckCircle, Tag } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ImageUpload } from '@/components/ImageUpload';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { validateCoupon } from '@/hooks/useCoupons';
import { motion, AnimatePresence } from 'framer-motion';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const SubmitListing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [listingType, setListingType] = useState<'free' | 'paid'>('free');
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

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  if (!user) return null;

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ''));
  };

  const validatePinCode = (pinCode: string): boolean => /^\d{6}$/.test(pinCode);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'phone') setErrors(prev => ({ ...prev, phone: '' }));
    if (name === 'pin_code') setErrors(prev => ({ ...prev, pinCode: '' }));
  };

  // ✅ Step Completion Validation
  const isStepComplete = () => {
    if (currentStep === 1)
      return formData.product_name && formData.description && formData.category && formData.product_type;
    if (currentStep === 2)
      return formData.rent_price && formData.pin_code && formData.address;
    if (currentStep === 3)
      return formData.images.length >= 1 && formData.phone;
    if (currentStep === 4)
      return listingType === 'free' || listingType === 'paid';
    return false;
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  // ✅ Dynamic Price Label
  const getPriceLabel = () => formData.product_type === 'sale' ? 'Price (₹)' : 'Price (₹/Day)';

  // ✅ Coupon Logic
  const handleApplyCoupon = async () => {
    if (!couponCode) {
      toast({ title: 'Coupon code required', description: 'Please enter a coupon code', variant: 'destructive' });
      return;
    }

    setValidatingCoupon(true);
    const result = await validateCoupon(couponCode);

    if (result.valid && result.coupon) {
      const originalPrice = 20;
      let discountAmount = result.coupon.is_percentage
        ? (originalPrice * result.coupon.discount_percentage) / 100
        : result.coupon.discount_amount;

      setDiscount(Math.min(discountAmount, originalPrice));
      setCouponApplied(true);
      toast({ title: 'Coupon applied!', description: `You saved ₹${Math.min(discountAmount, originalPrice)}` });
    } else {
      toast({ title: 'Invalid coupon', description: result.error || 'This coupon code is not valid', variant: 'destructive' });
    }
    setValidatingCoupon(false);
  };

  // ✅ Razorpay Script Load
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only submit if we're on step 4
    if (currentStep !== 4) {
      return;
    }

    if (!validatePhone(formData.phone)) {
      setErrors(prev => ({ ...prev, phone: 'Please enter a valid phone number' }));
      toast({ title: "Invalid phone number", variant: "destructive" });
      return;
    }

    if (!validatePinCode(formData.pin_code)) {
      setErrors(prev => ({ ...prev, pinCode: 'Please enter a valid PIN code' }));
      toast({ title: "Invalid PIN code", variant: "destructive" });
      return;
    }

    if (formData.images.length < 1) {
      toast({ title: "Upload at least 1 image", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      if (listingType === 'free') {
        await handleFreeListing();
      } else {
        await handlePaidListing();
      }
    } catch (error) {
      console.error('Error submitting listing:', error);
      toast({ title: 'Submission Failed', description: 'Please try again later', variant: 'destructive' });
      setLoading(false);
    }
  };

  const handleFreeListing = async () => {
    const listingData = {
      owner_user_id: user.id,
      ...formData,
      rent_price: Number(formData.rent_price),
      payment_transaction: 'FREE_LISTING',
      listing_type: 'free',
      original_price: 0,
      discount_amount: 0,
      final_price: 0,
      coupon_code: null,
    };
    
    const { error } = await supabase.from('listings').insert([listingData]);
    
    if (error) throw error;
    
    setLoading(false);
    toast({ title: "Free listing submitted!", description: "Your listing is pending admin approval." });
    navigate('/profile');
  };

  const handlePaidListing = async () => {
    const finalPrice = 20 - discount;
    
    // Create Razorpay order
    const { data: orderData, error: orderError } = await supabase.functions.invoke('create-razorpay-order', {
      body: { 
        amount: finalPrice,
        currency: 'INR',
        receipt: `listing_${Date.now()}`
      }
    });

    if (orderError || !orderData) {
      throw new Error('Failed to create payment order');
    }

    // Check if Razorpay script is loaded
    if (!window.Razorpay) {
      toast({ title: 'Payment gateway not loaded', description: 'Please refresh and try again', variant: 'destructive' });
      setLoading(false);
      return;
    }

    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'RentKaro',
      description: 'Paid Listing Fee',
      order_id: orderData.orderId,
      handler: async (response: any) => {
        // Payment successful - create listing
        try {
          const { error } = await supabase.from('listings').insert([{
            owner_user_id: user.id,
            ...formData,
            rent_price: Number(formData.rent_price),
            listing_type: 'paid',
            listing_status: 'pending',
            payment_verified: true,
            payment_transaction: response.razorpay_payment_id,
            original_price: 20,
            final_price: finalPrice,
            discount_amount: discount,
            coupon_code: couponCode || null
          }]);

          if (error) throw error;

          setLoading(false);
          toast({ 
            title: 'Payment Successful!', 
            description: 'Your listing has been submitted for approval'
          });
          navigate('/profile');
        } catch (err) {
          setLoading(false);
          toast({ title: 'Failed to create listing', variant: 'destructive' });
        }
      },
      modal: {
        ondismiss: () => {
          setLoading(false);
          toast({ 
            title: 'Payment Cancelled', 
            description: 'You can try again when ready',
            variant: 'destructive'
          });
        }
      },
      theme: {
        color: '#E5383B'
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const steps = ['Basic Info', 'Pricing & Location', 'Media & Contact', 'Listing Type'];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-20 md:pt-32 pb-12 md:pb-20">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              List Your Item
            </h1>
            <p className="text-base md:text-lg text-muted-foreground">
              Step {currentStep} of 4 — {steps[currentStep - 1]}
            </p>
          </motion.div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-3">
              {steps.map((step, idx) => (
                <div key={idx} className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    currentStep > idx + 1 ? 'bg-primary text-primary-foreground' :
                    currentStep === idx + 1 ? 'bg-primary text-primary-foreground' :
                    'bg-secondary text-secondary-foreground'
                  }`}>
                    {currentStep > idx + 1 ? '✓' : idx + 1}
                  </div>
                  <span className="text-xs mt-2 text-muted-foreground hidden md:block">{step}</span>
                </div>
              ))}
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>
          </div>

          <Card className="p-6 md:p-10 shadow-elegant border-border bg-card">
            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }} className="space-y-6">
                    <div>
                      <Label className="text-foreground font-medium mb-2 block">Product Name</Label>
                      <Input 
                        name="product_name" 
                        value={formData.product_name} 
                        onChange={handleChange} 
                        placeholder="e.g. iPhone 13, Sofa Set" 
                        required 
                        className="border-border focus:border-primary focus:ring-primary"
                      />
                    </div>
                    <div>
                      <Label className="text-foreground font-medium mb-2 block">Description</Label>
                      <Textarea 
                        name="description" 
                        value={formData.description} 
                        onChange={handleChange} 
                        placeholder="Describe your product features" 
                        required 
                        rows={4}
                        className="border-border focus:border-primary focus:ring-primary"
                      />
                    </div>
                    <div>
                      <Label className="text-foreground font-medium mb-2 block">Category</Label>
                      <select 
                        name="category" 
                        value={formData.category} 
                        onChange={handleChange} 
                        className="w-full border border-border bg-card text-foreground rounded-lg p-3 focus:border-primary focus:ring-primary focus:ring-1 outline-none transition-all" 
                        required
                      >
                        <option value="">Select a category</option>
                        <option value="electronics">Electronics</option>
                        <option value="vehicles">Vehicles</option>
                        <option value="furniture">Furniture</option>
                        <option value="tools">Tools</option>
                        <option value="sports">Sports</option>
                        <option value="books">Books</option>
                        <option value="clothing">Clothing</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-foreground font-medium mb-2 block">Product Type</Label>
                      <select 
                        name="product_type" 
                        value={formData.product_type} 
                        onChange={handleChange} 
                        className="w-full border border-border bg-card text-foreground rounded-lg p-3 focus:border-primary focus:ring-primary focus:ring-1 outline-none transition-all" 
                        required
                      >
                        <option value="rent">For Rent</option>
                        <option value="sale">For Sale</option>
                        <option value="both">Both</option>
                      </select>
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }} className="space-y-6">
                    <div>
                      <Label className="text-foreground font-medium mb-2 block">{getPriceLabel()}</Label>
                      <Input 
                        name="rent_price" 
                        type="number" 
                        min="1" 
                        value={formData.rent_price} 
                        onChange={handleChange} 
                        placeholder="Enter price amount" 
                        required 
                        className="border-border focus:border-primary focus:ring-primary"
                      />
                    </div>
                    <div>
                      <Label className="text-foreground font-medium mb-2 block">PIN Code</Label>
                      <Input 
                        name="pin_code" 
                        maxLength={6} 
                        value={formData.pin_code} 
                        onChange={handleChange} 
                        placeholder="Enter your 6-digit area code" 
                        required 
                        className="border-border focus:border-primary focus:ring-primary"
                      />
                    </div>
                    <div>
                      <Label className="text-foreground font-medium mb-2 block">Address</Label>
                      <Textarea 
                        name="address" 
                        value={formData.address} 
                        onChange={handleChange} 
                        placeholder="Enter full address" 
                        required 
                        rows={3}
                        className="border-border focus:border-primary focus:ring-primary"
                      />
                    </div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }} className="space-y-6">
                    <div>
                      <Label className="text-foreground font-medium mb-2 block">Product Images</Label>
                      <ImageUpload userId={user.id} currentImages={formData.images} onImagesUploaded={(urls) => setFormData({ ...formData, images: urls })} maxImages={100} />
                    </div>
                    <div>
                      <Label className="text-foreground font-medium mb-2 block">Contact Phone</Label>
                      <Input 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleChange} 
                        placeholder="Enter your 10-digit number" 
                        required 
                        className="border-border focus:border-primary focus:ring-primary"
                      />
                    </div>
                  </motion.div>
                )}

                {currentStep === 4 && (
                  <motion.div key="step4" initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }} className="space-y-6">
                    <Label className="text-foreground font-medium mb-4 block">Listing Type</Label>
                    <RadioGroup value={listingType} onValueChange={(v: 'free' | 'paid') => setListingType(v)}>
                      <div className="flex items-center space-x-3 border border-border bg-card hover:bg-secondary/50 rounded-lg p-4 transition-all cursor-pointer">
                        <RadioGroupItem value="free" id="free" className="border-primary text-primary" />
                        <Label htmlFor="free" className="cursor-pointer flex-1">
                          <span className="font-semibold text-foreground">Free Listing</span>
                          <span className="text-muted-foreground ml-2">- ₹0 (Standard Visibility)</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 border border-border bg-card hover:bg-secondary/50 rounded-lg p-4 mt-3 transition-all cursor-pointer">
                        <RadioGroupItem value="paid" id="paid" className="border-primary text-primary" />
                        <Label htmlFor="paid" className="cursor-pointer flex-1">
                          <span className="font-semibold text-foreground">Paid Listing</span>
                          <span className="text-muted-foreground ml-2">- ₹20 (Priority Listing)</span>
                        </Label>
                      </div>
                    </RadioGroup>

                    {listingType === 'paid' && (
                      <div className="space-y-4 pt-4 border-t border-border">
                        <Label className="text-foreground font-medium block flex items-center gap-2">
                          <Tag className="w-4 h-4" />
                          Have a Coupon Code?
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            placeholder="Enter coupon code"
                            disabled={couponApplied}
                            className="border-border focus:border-primary focus:ring-primary"
                          />
                          <Button
                            type="button"
                            onClick={handleApplyCoupon}
                            disabled={validatingCoupon || couponApplied}
                            variant="outline"
                            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                          >
                            {validatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : couponApplied ? <CheckCircle className="w-4 h-4" /> : 'Apply'}
                          </Button>
                        </div>
                        {couponApplied && discount > 0 && (
                          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                              <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                                Coupon Applied Successfully!
                              </p>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Original Price: <span className="line-through">₹20</span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Discount: -₹{discount}
                            </p>
                            <p className="text-lg font-bold text-foreground mt-2">
                              Final Price: ₹{20 - discount}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-8 gap-4">
                {currentStep > 1 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={prevStep}
                    className="border-border hover:bg-secondary"
                  >
                    Back
                  </Button>
                )}
                {currentStep < 4 ? (
                  <Button 
                    type="button" 
                    onClick={nextStep} 
                    disabled={!isStepComplete()}
                    className="ml-auto bg-primary hover:bg-accent text-primary-foreground"
                  >
                    Next
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="ml-auto bg-primary hover:bg-accent text-primary-foreground"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : listingType === 'free' ? (
                      'Submit Free Listing'
                    ) : (
                      'Continue to Payment'
                    )}
                  </Button>
                )}
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SubmitListing;
