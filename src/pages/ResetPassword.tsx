import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Loader2,
    Lock,
    Check,
    Eye,
    EyeOff,
    KeyRound,
    ShieldCheck,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { LoginNavbar } from "@/components/LoginNavbar";

export default function ResetPassword() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isValidSession, setIsValidSession] = useState(false);
    const [checkingSession, setCheckingSession] = useState(true);
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: "",
    });

    // Check if user came from a valid reset link
    useEffect(() => {
        const checkSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error("Session error:", error);
                    setIsValidSession(false);
                } else if (session) {
                    // User has a valid session from the reset link
                    setIsValidSession(true);
                } else {
                    setIsValidSession(false);
                }
            } catch (err) {
                console.error("Error checking session:", err);
                setIsValidSession(false);
            } finally {
                setCheckingSession(false);
            }
        };

        checkSession();

        // Listen for auth state changes (when user clicks reset link)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                setIsValidSession(true);
                setCheckingSession(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async () => {
        if (!formData.password) {
            toast({
                title: "Password Required",
                description: "Please enter a new password",
                variant: "destructive",
            });
            return;
        }

        if (formData.password.length < 6) {
            toast({
                title: "Password Too Short",
                description: "Password must be at least 6 characters",
                variant: "destructive",
            });
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast({
                title: "Passwords Don't Match",
                description: "Please make sure both passwords are the same",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: formData.password,
            });

            if (error) {
                throw error;
            }

            toast({
                title: "Password Updated!",
                description: "Your password has been successfully reset. You can now login.",
            });

            // Sign out and redirect to login
            await supabase.auth.signOut();
            navigate("/login");
        } catch (error: any) {
            console.error("Password reset error:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to reset password. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    if (checkingSession) {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{ background: "#0B090A" }}
            >
                <div className="text-center">
                    <Loader2 className="w-8 h-8 text-[#E5383B] animate-spin mx-auto mb-4" />
                    <p className="text-[#B1A7A6]">Verifying your reset link...</p>
                </div>
            </div>
        );
    }

    if (!isValidSession) {
        return (
            <div
                className="min-h-screen flex flex-col relative overflow-hidden"
                style={{ background: "#0B090A" }}
            >
                <LoginNavbar />
                <div className="flex-1 flex items-center justify-center p-6">
                    <div className="max-w-md w-full text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                            <Lock className="w-8 h-8 text-red-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-[#F5F3F4] mb-2">Invalid or Expired Link</h1>
                        <p className="text-[#B1A7A6] mb-6">
                            This password reset link is invalid or has expired. Please request a new one.
                        </p>
                        <button
                            onClick={() => navigate("/login")}
                            className="px-6 py-3 rounded-2xl font-bold text-base transition-all shadow-md hover:shadow-[#E5383B]/30"
                            style={{
                                background: "linear-gradient(135deg, #E5383B, #BA181B)",
                                color: "#F5F3F4",
                            }}
                        >
                            Go to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen flex relative overflow-hidden"
            style={{ background: "#0B090A" }}
        >
            <LoginNavbar />

            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[150px] opacity-20"
                    style={{
                        background: "radial-gradient(circle, #E5383B, transparent)",
                        animation: "float 15s ease-in-out infinite",
                    }}
                />
                <div
                    className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-15"
                    style={{
                        background: "radial-gradient(circle, #BA181B, transparent)",
                        animation: "float 12s ease-in-out infinite reverse",
                    }}
                />
            </div>

            {/* Left Section */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1555421689-491a97ff2040?w=1200&h=1600&fit=crop"
                        alt="Reset Password Background"
                        className="w-full h-full object-cover"
                        style={{ filter: "brightness(0.6) contrast(1.1)" }}
                    />
                </div>
                <div
                    className="absolute inset-0"
                    style={{
                        background: "linear-gradient(135deg, rgba(229,56,59,0.4), rgba(11,9,10,0.8))",
                    }}
                />
                <div className="relative z-10 flex flex-col justify-end p-12 lg:p-16">
                    <div className="space-y-6">
                        <div
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl"
                            style={{
                                background: "rgba(229, 56, 59, 0.2)",
                                border: "1px solid rgba(229, 56, 59, 0.3)",
                            }}
                        >
                            <ShieldCheck className="w-4 h-4 text-[#F5F3F4]" />
                            <span className="text-sm font-bold text-[#F5F3F4] tracking-wide">
                                Secure Reset
                            </span>
                        </div>

                        <h1 className="text-5xl font-black text-[#F5F3F4] leading-tight">
                            Create Your <br />
                            <span
                                style={{
                                    background: "linear-gradient(135deg, #E5383B, #BA181B)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                }}
                            >
                                New Password
                            </span>
                        </h1>
                        <p className="text-lg text-[#D3D3D3] max-w-md">
                            Choose a strong password to keep your account secure.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Section (Form) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative z-10">
                <div className="w-full max-w-md">
                    {/* Header */}
                    <div className="mb-8 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl mb-4"
                            style={{
                                background: "rgba(229, 56, 59, 0.2)",
                                border: "1px solid rgba(229, 56, 59, 0.3)",
                            }}
                        >
                            <KeyRound className="w-4 h-4 text-[#E5383B]" />
                            <span className="text-sm font-medium text-[#F5F3F4]">Reset Password</span>
                        </div>
                        <h2 className="text-2xl font-bold text-[#F5F3F4]">Set Your New Password</h2>
                        <p className="text-[#B1A7A6] mt-2">Enter your new password below</p>
                    </div>

                    {/* Form */}
                    <div className="rounded-3xl p-8 backdrop-blur-2xl border border-[#E5383B]/20 bg-white/5">
                        <div className="space-y-5">
                            {/* New Password */}
                            <div className="relative group">
                                <label className="text-sm text-[#B1A7A6] mb-2 block">New Password</label>
                                <div
                                    className="relative rounded-2xl p-[1px]"
                                    style={{
                                        background: "linear-gradient(135deg, rgba(229,56,59,0.3), rgba(186,24,27,0.2))",
                                    }}
                                >
                                    <div className="rounded-2xl overflow-hidden bg-[#161A1D]/60">
                                        <div className="flex items-center px-5 py-4 gap-3">
                                            <Lock className="w-5 h-5 text-[#E5383B]" />
                                            <input
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="Enter new password"
                                                className="flex-1 bg-transparent text-[#F5F3F4] outline-none placeholder:text-[#B1A7A6]"
                                                aria-label="New password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="text-[#B1A7A6] hover:text-[#E5383B]"
                                                aria-label={showPassword ? "Hide password" : "Show password"}
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="relative group">
                                <label className="text-sm text-[#B1A7A6] mb-2 block">Confirm Password</label>
                                <div
                                    className="relative rounded-2xl p-[1px]"
                                    style={{
                                        background: "linear-gradient(135deg, rgba(229,56,59,0.3), rgba(186,24,27,0.2))",
                                    }}
                                >
                                    <div className="rounded-2xl overflow-hidden bg-[#161A1D]/60">
                                        <div className="flex items-center px-5 py-4 gap-3">
                                            <Lock className="w-5 h-5 text-[#E5383B]" />
                                            <input
                                                name="confirmPassword"
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                placeholder="Confirm new password"
                                                className="flex-1 bg-transparent text-[#F5F3F4] outline-none placeholder:text-[#B1A7A6]"
                                                aria-label="Confirm new password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="text-[#B1A7A6] hover:text-[#E5383B]"
                                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                            >
                                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Password match indicator */}
                            {formData.password && formData.confirmPassword && (
                                <div className={`flex items-center gap-2 text-sm ${formData.password === formData.confirmPassword ? 'text-green-400' : 'text-red-400'}`}>
                                    {formData.password === formData.confirmPassword ? (
                                        <>
                                            <Check className="w-4 h-4" />
                                            <span>Passwords match</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="w-4 h-4 rounded-full bg-red-400/20 flex items-center justify-center text-xs">×</span>
                                            <span>Passwords don't match</span>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                onClick={handleSubmit}
                                disabled={!formData.password || !formData.confirmPassword || loading}
                                className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-[#E5383B]/30 mt-4"
                                style={{
                                    background: formData.password && formData.confirmPassword
                                        ? "linear-gradient(135deg, #E5383B, #BA181B)"
                                        : "rgba(177,167,166,0.2)",
                                    color: formData.password && formData.confirmPassword ? "#F5F3F4" : "#B1A7A6",
                                }}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" /> Updating...
                                    </>
                                ) : (
                                    <>
                                        Reset Password <Check className="w-5 h-5" />
                                    </>
                                )}
                            </button>

                            {/* Back to login */}
                            <div className="text-center mt-4">
                                <button
                                    onClick={() => navigate("/login")}
                                    className="text-sm text-[#B1A7A6] hover:text-[#E5383B] transition-colors"
                                >
                                    Back to Login
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0px 1000px transparent inset !important;
          box-shadow: 0 0 0px 1000px transparent inset !important;
          -webkit-text-fill-color: #F5F3F4 !important;
          caret-color: #F5F3F4 !important;
          background-color: transparent !important;
          transition: background-color 9999s ease-in-out 0s;
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(50px, -50px); }
        }
      `}</style>
        </div>
    );
}
