import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import SEO from '@/components/SEO';
import { motion } from 'framer-motion';
import { 
  InfoIcon, 
  Mail, 
  Eye, 
  EyeOff, 
  User, 
  Stethoscope, 
  ArrowRight, 
  AlertCircle,
  CheckCircle,
  Loader2,
  Activity
} from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<'patient' | 'doctor'>('doctor');
  const [email, setEmail] = useState('doctor@example.com');
  const [password, setPassword] = useState('doctor123');
  const [clinicId, setClinicId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const demoCredentials = {
    patient: { email: 'patient@example.com', password: 'password123' },
    doctor: { email: 'doctor@example.com', password: 'doctor123', clinicId: 'CLINIC123' }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    }
    if (role === 'doctor' && !clinicId.trim()) {
      newErrors.clinicId = 'Clinic ID is required for doctors';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { setUser } = useAuth();

  const handleRealLogin = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    setErrors({});
    
    try {
      if (email.trim() === 'doctor@example.com' && password === 'doctor123') {
        setUser({
          id: 'doctor-001',
          email: 'doctor@example.com',
          role: 'doctor',
          tenant_id: null,
          profile: null
        });
        toast({ title: "Login Successful!", description: `Welcome Dr. Smith!` });
        navigate('/doctor/dashboard');
      } else {
        throw new Error('Invalid credentials. Use doctor@example.com / doctor123');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({ title: "Login Failed", description: errorMessage, variant: "destructive" });
      if (errorMessage.includes('email')) setErrors({ email: errorMessage });
      else if (errorMessage.includes('password')) setErrors({ password: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (selectedRole: 'patient' | 'doctor') => {
    setRole(selectedRole);
    if (selectedRole === 'patient') {
      setEmail(demoCredentials.patient.email);
      setPassword(demoCredentials.patient.password);
      setClinicId('');
    } else {
      setEmail(demoCredentials.doctor.email);
      setPassword(demoCredentials.doctor.password);
      setClinicId(demoCredentials.doctor.clinicId);
    }
    setErrors({});
    toast({ title: "Demo Mode Activated", description: `Using demo ${selectedRole} credentials` });
    navigate(selectedRole === 'patient' ? '/patient/dashboard' : '/doctor/dashboard');
  };

  return (
    <>
      <SEO 
        title="Sign In - QuantumOS"
        description="Securely sign in to your QuantumHealth workspace."
      />
      
      <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 font-sans selection:bg-healthy-500/20 selection:text-healthy-700">
        
        {/* Left Side Branding (Hidden on mobile) */}
        <div className="hidden md:flex md:w-1/2 bg-slate-900 p-12 flex-col justify-between relative overflow-hidden text-white">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
          
          <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-blue-500/20 blur-[120px] pointer-events-none animate-blob"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-healthy-500/20 blur-[100px] pointer-events-none animate-blob" style={{ animationDelay: '2s' }}></div>

          <div className="relative z-10">
            <Link to="/" className="flex items-center gap-3 w-fit">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-healthy-400 to-blue-500 flex items-center justify-center shadow-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">QuantumHealth</span>
            </Link>
          </div>

          <div className="relative z-10 max-w-md">
            <h2 className="text-4xl font-bold mb-6 leading-tight">
              Manage your clinic <br/>
              <span className="text-healthy-400">effortlessly.</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              Join thousands of healthcare professionals who rely on QuantumOS for their daily operations.
            </p>
            <div className="flex gap-4 items-center">
               <div className="flex -space-x-4">
                 {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden">
                       <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User avatar" />
                    </div>
                 ))}
               </div>
               <div className="text-sm font-medium text-slate-300">
                  Trusted by 5,000+ teams
               </div>
            </div>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 relative">
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-healthy-200/40 blur-[80px] -z-10 animate-blob"></div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            {/* Mobile Branding */}
            <div className="md:hidden flex flex-col items-center mb-10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-healthy-500 to-blue-600 flex items-center justify-center shadow-lg mb-4">
                <Activity className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">QuantumOS</h1>
            </div>

            <Card className="glass-card shadow-2xl border-white/60">
              <CardHeader className="space-y-1 pb-6">
                <CardTitle className="text-2xl font-bold text-slate-900">Welcome back</CardTitle>
                <CardDescription className="text-slate-500 text-base">
                  Enter your credentials to access your workspace
                </CardDescription>
              </CardHeader>
              
              <Tabs defaultValue="doctor" onValueChange={(value) => setRole(value as 'patient' | 'doctor')} className="px-6">
                <TabsList className="grid w-full grid-cols-2 p-1 bg-slate-100 rounded-xl mb-6">
                  <TabsTrigger value="patient" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <User className="h-4 w-4 mr-2" />
                    Patient
                  </TabsTrigger>
                  <TabsTrigger value="doctor" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <Stethoscope className="h-4 w-4 mr-2" />
                    Doctor
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="patient" className="mt-0">
                  <form onSubmit={(e) => { e.preventDefault(); handleRealLogin(); }}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email-p" className="text-sm font-semibold text-slate-700">Email Address</Label>
                        <div className="relative">
                          <Input 
                            id="email-p" type="email" placeholder="patient@example.com" 
                            value={email} onChange={(e) => setEmail(e.target.value)}
                            className={`pl-10 h-11 bg-white/50 focus:bg-white transition-colors ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                          />
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        </div>
                        {errors.email && <p className="text-sm text-red-500 flex items-center"><AlertCircle className="h-3 w-3 mr-1" />{errors.email}</p>}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password-p" className="text-sm font-semibold text-slate-700">Password</Label>
                          <Link to="/password-reset" className="text-sm text-healthy-600 hover:text-healthy-700 font-medium">Forgot password?</Link>
                        </div>
                        <div className="relative">
                          <Input 
                            id="password-p" type={showPassword ? 'text' : 'password'} placeholder="••••••••" 
                            value={password} onChange={(e) => setPassword(e.target.value)}
                            className={`pl-10 pr-10 h-11 bg-white/50 focus:bg-white transition-colors ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                          />
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400">
                             <Lock className="h-4 w-4" />
                          </div>
                          <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-slate-400 hover:text-slate-600" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        {errors.password && <p className="text-sm text-red-500 flex items-center"><AlertCircle className="h-3 w-3 mr-1" />{errors.password}</p>}
                      </div>
                    </div>

                    <div className="mt-8 space-y-4">
                      <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white h-11 rounded-lg shadow-md" disabled={isLoading}>
                        {isLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Signing In...</> : 'Sign In'}
                      </Button>
                      <Button type="button" variant="outline" className="w-full h-11 rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50" onClick={() => handleDemoLogin('patient')}>
                        Continue as Demo Patient
                      </Button>
                    </div>
                  </form>
                </TabsContent>
                
                <TabsContent value="doctor" className="mt-0">
                  <form onSubmit={(e) => { e.preventDefault(); handleRealLogin(); }}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email-d" className="text-sm font-semibold text-slate-700">Work Email</Label>
                        <div className="relative">
                          <Input 
                            id="email-d" type="email" placeholder="doctor@example.com" 
                            value={email} onChange={(e) => setEmail(e.target.value)}
                            className={`pl-10 h-11 bg-white/50 focus:bg-white transition-colors ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                          />
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        </div>
                        {errors.email && <p className="text-sm text-red-500 flex items-center"><AlertCircle className="h-3 w-3 mr-1" />{errors.email}</p>}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password-d" className="text-sm font-semibold text-slate-700">Password</Label>
                          <Link to="/password-reset" className="text-sm text-healthy-600 hover:text-healthy-700 font-medium">Forgot password?</Link>
                        </div>
                        <div className="relative">
                          <Input 
                            id="password-d" type={showPassword ? 'text' : 'password'} placeholder="••••••••" 
                            value={password} onChange={(e) => setPassword(e.target.value)}
                            className={`pl-10 pr-10 h-11 bg-white/50 focus:bg-white transition-colors ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                          />
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400">
                             <Lock className="h-4 w-4" />
                          </div>
                          <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-slate-400 hover:text-slate-600" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        {errors.password && <p className="text-sm text-red-500 flex items-center"><AlertCircle className="h-3 w-3 mr-1" />{errors.password}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="clinic-id" className="text-sm font-semibold text-slate-700">Clinic ID</Label>
                        <Input 
                          id="clinic-id" type="text" placeholder="CLINIC123" 
                          value={clinicId} onChange={(e) => setClinicId(e.target.value)}
                          className={`h-11 bg-white/50 focus:bg-white transition-colors ${errors.clinicId ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                        />
                        {errors.clinicId && <p className="text-sm text-red-500 flex items-center"><AlertCircle className="h-3 w-3 mr-1" />{errors.clinicId}</p>}
                      </div>
                    </div>

                    <div className="mt-8 pb-6 space-y-4">
                      <Button type="submit" className="w-full bg-healthy-600 hover:bg-healthy-700 text-white h-11 rounded-lg shadow-md transition-colors" disabled={isLoading}>
                        {isLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Signing In...</> : 'Sign In as Provider'}
                      </Button>
                      <Button type="button" variant="outline" className="w-full h-11 rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50" onClick={() => handleDemoLogin('doctor')}>
                        Continue as Demo Doctor
                      </Button>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            </Card>

            <div className="text-center mt-8">
              <p className="text-sm text-slate-500">
                Don't have an account?{' '}
                <Link to="/register" className="text-healthy-600 hover:text-healthy-700 font-medium hover:underline inline-flex items-center">
                  Create a workspace
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </p>
            </div>
            
            {/* Demo Notice */}
            <div className="mt-8 text-center text-xs text-slate-400">
               Demo environment is reset daily. Data entered is not persisted.
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Login;
