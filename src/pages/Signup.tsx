import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    pin_code: '',
  });
  
  const [errors, setErrors] = useState({
    phone: '',
    pinCode: '',
  });

  const validatePhone = (phone: string): boolean => {
    // Indian phone number validation: exactly 10 digits
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ''));
  };

  const validatePinCode = (pinCode: string): boolean => {
    // Indian PIN code validation: exactly 6 digits
    const pinCodeRegex = /^\d{6}$/;
    return pinCodeRegex.test(pinCode);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate phone number
    if (!validatePhone(formData.phone)) {
      setErrors(prev => ({ 
        ...prev, 
        phone: 'Please enter a valid 10-digit Indian phone number (e.g., 9876543210)' 
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
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    const success = await signup({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      pin_code: formData.pin_code,
    });

    setLoading(false);

    if (success) {
      navigate('/listings');
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/listings`,
        },
      });

      if (error) {
        toast({
          title: "Signup failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Google signup error:', error);
      toast({
        title: "Signup failed",
        description: "Failed to signup with Google",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-4xl font-serif font-bold text-foreground mb-2">
              Create Account
            </h1>
            <p className="text-muted-foreground">
              Join RentKaro and start your rental journey
            </p>
          </div>

          <Card className="p-8 shadow-elegant animate-scale-in">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="transition-all duration-300 focus:shadow-card"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="transition-all duration-300 focus:shadow-card"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter the number"
                  className={`transition-all duration-300 focus:shadow-card ${errors.phone ? 'border-destructive' : ''}`}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone}</p>
                )}
                <p className="text-xs text-muted-foreground">Enter a valid 10-digit Indian mobile number</p>
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
                <p className="text-xs text-muted-foreground">Enter your area's 6-digit PIN code</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className="transition-all duration-300 focus:shadow-card"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  className="transition-all duration-300 focus:shadow-card"
                />
              </div>

              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Sign Up'
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full"
                onClick={handleGoogleSignup}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Sign up with Google
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:text-accent font-medium transition-colors">
                  Login here
                </Link>
              </p>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Signup;
