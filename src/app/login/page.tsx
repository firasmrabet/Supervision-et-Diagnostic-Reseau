"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Lock, Mail, Server, Shield, Sparkles, Key } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { fetchAPI } from "@/lib/utils";
import { GoogleLogin } from "@react-oauth/google";

type AuthStep = "login" | "register" | "verify";

export default function LoginPage() {
  const [step, setStep] = useState<AuthStep>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const router = useRouter();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetchAPI("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem("netpulse_token", res.access_token);
      localStorage.setItem("netpulse_user", JSON.stringify(res.user));
      router.push("/");
    } catch (err: any) {
      if (err.message === "verification_required") {
        setStep("verify");
        setError("Your email is not verified. Check your inbox for the code.");
      } else {
        setError(err.message || "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      await fetchAPI("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setSuccessMsg("Registration successful! Check your email (or server console) for the verification code.");
      setStep("verify");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetchAPI("/api/auth/verify-email", {
        method: "POST",
        body: JSON.stringify({ email, code: verificationCode }),
      });
      
      // Auto login after verification
      localStorage.setItem("netpulse_token", res.access_token);
      localStorage.setItem("netpulse_user", JSON.stringify(res.user));
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setLoading(true);
      setError("");
      const res = await fetchAPI("/api/auth/google", {
        method: "POST",
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      localStorage.setItem("netpulse_token", res.access_token);
      localStorage.setItem("netpulse_user", JSON.stringify(res.user));
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Google authentication failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/20 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary p-[1px] mb-4">
            <div className="w-full h-full rounded-2xl bg-surface flex items-center justify-center">
              <Server className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-text-primary">NetPulse AI</h1>
          <p className="text-text-secondary mt-2 flex items-center gap-2">
            <Shield className="w-4 h-4" /> Professional Intelligence Node
          </p>
        </div>

        <GlassCard className="p-8">
          <h2 className="text-2xl font-bold text-text-primary mb-6 text-center">
            {step === "login" && "System Access"}
            {step === "register" && "Initialize Agent"}
            {step === "verify" && "Verify Email"}
          </h2>

          <AnimatePresence mode="wait">
            {step === "verify" ? (
              <motion.form
                key="verify"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleVerifySubmit}
                className="space-y-4"
              >
                <div className="text-sm text-text-secondary mb-4 text-center">
                  We've sent a 6-digit verification code to <span className="text-primary font-bold">{email}</span>.
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">VERIFICATION CODE</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-primary/50 transition-colors tracking-widest text-lg font-mono text-center"
                      placeholder="000000"
                    />
                  </div>
                </div>
                
                {error && (
                  <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
                    {error}
                  </div>
                )}
                {successMsg && (
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm">
                    {successMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || verificationCode.length !== 6}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold glow-primary mt-6 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      Verify & Access
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setStep("login")}
                  className="w-full py-2 text-sm text-text-muted hover:text-white transition-colors"
                >
                  Back to login
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="auth"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={step === "login" ? handleLoginSubmit : handleRegisterSubmit}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">IDENTIFIER (EMAIL)</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-primary/50 transition-colors"
                      placeholder="admin@netpulse.ai"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">SECURITY KEY (PASSWORD)</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-primary/50 transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
                    {error}
                  </div>
                )}
                {successMsg && (
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm">
                    {successMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold glow-primary mt-6 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      {step === "login" ? "Authenticate" : "Create Node"}
                    </>
                  )}
                </button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-surface px-2 text-text-muted">OR</span>
                  </div>
                </div>

                <div className="flex justify-center w-full">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError("Google Login Failed")}
                    theme="filled_black"
                    shape="pill"
                    text={step === "login" ? "signin_with" : "signup_with"}
                    ux_mode="popup"
                    use_fedcm_for_prompt={false as any}
                  />
                </div>

                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(step === "login" ? "register" : "login");
                      setError("");
                      setSuccessMsg("");
                    }}
                    className="text-sm text-text-muted hover:text-white transition-colors mt-4"
                  >
                    {step === "login" ? "Initialize a new agent node? Register" : "Already have access? Authenticate"}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </GlassCard>
      </motion.div>
    </div>
  );
}
