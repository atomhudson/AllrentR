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
      return formData.images.length >= 5 && formData.phone;
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
    return () => { document.body.removeChild(script); };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

    if (formData.images.length < 5) {
      toast({ title: "Upload at least 5 images", variant: "destructive" });
      return;
    }

    if (listingType === 'free') {
      const listingData = {
        owner_user_id: user.id,
        ...formData,
        rent_price: Number(formData.rent_price),
        payment_transaction: 'FREE_LISTING',
        listing_type: 'free',
        original_price: 0,
        discount_amount: 0,
        final_price: 0,
      };
      await supabase.from('listings').insert([listingData]);
      toast({ title: "Free listing submitted!", description: "Your listing is pending admin approval." });
      navigate('/profile');
    } else {
      // Razorpay Payment flow
    }
  };

  const steps = ['Basic Info', 'Pricing & Location', 'Media & Contact', 'Listing Type'];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-serif font-bold text-foreground mb-2">List Your Item</h1>
            <p className="text-muted-foreground">Step {currentStep} of 4 — {steps[currentStep - 1]}</p>
          </div>

          <Card className="p-8 shadow-elegant">
            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }} className="space-y-6">
                    <div>
                      <Label>Product Name</Label>
                      <Input name="product_name" value={formData.product_name} onChange={handleChange} placeholder="e.g. iPhone 13, Sofa Set" required />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea name="description" value={formData.description} onChange={handleChange} placeholder="Describe your product features" required rows={4} />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <select name="category" value={formData.category} onChange={handleChange} className="w-full border rounded-lg p-2" required>
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
                      <Label>Product Type</Label>
                      <select name="product_type" value={formData.product_type} onChange={handleChange} className="w-full border rounded-lg p-2" required>
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
                      <Label>{getPriceLabel()}</Label>
                      <Input name="rent_price" type="number" min="1" value={formData.rent_price} onChange={handleChange} placeholder="Enter price amount" required />
                    </div>
                    <div>
                      <Label>PIN Code</Label>
                      <Input name="pin_code" maxLength={6} value={formData.pin_code} onChange={handleChange} placeholder="Enter your 6-digit area code" required />
                    </div>
                    <div>
                      <Label>Address</Label>
                      <Textarea name="address" value={formData.address} onChange={handleChange} placeholder="Enter full address" required rows={3} />
                    </div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }} className="space-y-6">
                    <div>
                      <Label>Product Images (Min 5)</Label>
                      <ImageUpload userId={user.id} currentImages={formData.images} onImagesUploaded={(urls) => setFormData({ ...formData, images: urls })} maxImages={5} />
                    </div>
                    <div>
                      <Label>Contact Phone</Label>
                      <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="Enter your 10-digit number" required />
                    </div>
                  </motion.div>
                )}

                {currentStep === 4 && (
                  <motion.div key="step4" initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }} className="space-y-6">
                    <Label>Listing Type</Label>
                    <RadioGroup value={listingType} onValueChange={(v: 'free' | 'paid') => setListingType(v)}>
                      <div className="flex items-center space-x-3 border rounded-lg p-4">
                        <RadioGroupItem value="free" id="free" />
                        <Label htmlFor="free">Free Listing - ₹0 (Standard Visibility)</Label>
                      </div>
                      <div className="flex items-center space-x-3 border rounded-lg p-4 mt-3">
                        <RadioGroupItem value="paid" id="paid" />
                        <Label htmlFor="paid">Paid Listing - ₹20 (Priority Listing)</Label>
                      </div>
                    </RadioGroup>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                {currentStep > 1 && (
                  <Button type="button" variant="outline" onClick={prevStep}>Back</Button>
                )}
                {currentStep < 4 ? (
                  <Button type="button" onClick={nextStep} disabled={!isStepComplete()}>
                    Next
                  </Button>
                ) : (
                  <Button type="submit" disabled={loading}>
                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</> : listingType === 'free' ? 'Submit Free Listing' : 'Continue to Payment'}
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
