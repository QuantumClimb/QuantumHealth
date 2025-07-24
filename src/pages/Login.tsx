
/**
 * Enhanced Login Component
 * Real authentication with demo fallback
 */

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
import { authService, LoginCredentials } from '@/services/authService';
import SEO from '@/components/SEO';
import { 
  InfoIcon, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  Stethoscope, 
  ArrowRight, 
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [clinicId, setClinicId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // Demo credentials
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

  const handleRealLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    
    try {
      const credentials: LoginCredentials = {
        email: email.trim(),
        password,
        role,
        ...(role === 'doctor' && { clinic_id: clinicId.trim() })
      };

      const user = await authService.loginUser(credentials);
      
      if (user) {
        toast({
          title: "Login Successful!",
          description: `Welcome back, ${user.profile?.first_name || 'User'}!`,
        });
        
        // Navigate to appropriate dashboard
        if (user.role === 'patient') {
          navigate('/patient/dashboard');
        } else {
          navigate('/doctor/dashboard');
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });

      // Set specific field errors if available
      if (errorMessage.includes('email')) {
        setErrors({ email: errorMessage });
      } else if (errorMessage.includes('password')) {
        setErrors({ password: errorMessage });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (selectedRole: 'patient' | 'doctor') => {
    setRole(selectedRole);
    
    // Pre-fill demo credentials
    if (selectedRole === 'patient') {
      setEmail(demoCredentials.patient.email);
      setPassword(demoCredentials.patient.password);
      setClinicId('');
    } else {
      setEmail(demoCredentials.doctor.email);
      setPassword(demoCredentials.doctor.password);
      setClinicId(demoCredentials.doctor.clinicId);
    }

    // Clear any existing errors
    setErrors({});

    toast({
      title: "Demo Mode Activated",
      description: `Using demo ${selectedRole} credentials`,
    });

    // Navigate to appropriate dashboard
    if (selectedRole === 'patient') {
      navigate('/patient/dashboard');
    } else {
      navigate('/doctor/dashboard');
    }
  };

  const handleForgotPassword = () => {
    navigate('/password-reset');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <>
      <SEO 
        title="Login - QUANTUM HEALTH"
        description="Sign in to your QUANTUM HEALTH account. Access your patient or doctor portal with secure authentication."
        keywords="login, sign in, patient portal, doctor portal, healthcare login, medical portal access"
        url="https://quantumhealth.quantum-climb.com/login"
        tags={['login', 'authentication', 'patient portal', 'doctor portal']}
      />
      
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white to-gray-50 p-4">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-healthy-400 to-nature-500 text-transparent bg-clip-text mb-2">
            QUANTUM HEALTH
          </h1>
          <p className="text-gray-500">Revolutionary healthcare management platform</p>
        </div>
        
        <Card className="w-full max-w-md glass-card animate-scale-in shadow-xl">
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>
              Sign in to your QUANTUM HEALTH account to continue
            </CardDescription>
          </CardHeader>
          
          <Tabs defaultValue="patient" onValueChange={(value) => setRole(value as 'patient' | 'doctor')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="patient" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Patient</span>
              </TabsTrigger>
              <TabsTrigger value="doctor" className="flex items-center space-x-2">
                <Stethoscope className="h-4 w-4" />
                <span>Doctor</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="patient">
              <CardContent className="space-y-4 pt-4">
                <Alert className="bg-blue-50 border-blue-200">
                  <InfoIcon className="h-4 w-4 text-blue-500 mr-2" />
                  <AlertDescription className="text-sm text-blue-700">
                    <strong>Demo Patient Login Available</strong> - Use the demo button below for quick access
                  </AlertDescription>
                </Alert>
                
                <form onSubmit={(e) => { e.preventDefault(); handleRealLogin(); }}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                      <div className="relative">
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="patient@example.com" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)}
                          className={errors.email ? 'border-red-500 pr-10' : 'pr-10'}
                        />
                        <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                      {errors.email && (
                        <p className="text-sm text-red-500 mt-1 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {errors.email}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                      <div className="relative">
                        <Input 
                          id="password" 
                          type={showPassword ? 'text' : 'password'} 
                          placeholder="••••••••" 
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)}
                          className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {errors.password && (
                        <p className="text-sm text-red-500 mt-1 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {errors.password}
                        </p>
                      )}
                    </div>
                  </div>
                </form>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-healthy-400 to-nature-500 hover:from-healthy-500 hover:to-nature-600" 
                  onClick={handleRealLogin} 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Sign In
                    </>
                  )}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleDemoLogin('patient')}
                >
                  Continue as Demo Patient
                </Button>
              </CardFooter>
            </TabsContent>
            
            <TabsContent value="doctor">
              <CardContent className="space-y-4 pt-4">
                <Alert className="bg-green-50 border-green-200">
                  <InfoIcon className="h-4 w-4 text-green-500 mr-2" />
                  <AlertDescription className="text-sm text-green-700">
                    <strong>Demo Doctor Login Available</strong> - Use the demo button below for quick access
                  </AlertDescription>
                </Alert>
                
                <form onSubmit={(e) => { e.preventDefault(); handleRealLogin(); }}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                      <div className="relative">
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="doctor@example.com" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)}
                          className={errors.email ? 'border-red-500 pr-10' : 'pr-10'}
                        />
                        <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                      {errors.email && (
                        <p className="text-sm text-red-500 mt-1 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {errors.email}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                      <div className="relative">
                        <Input 
                          id="password" 
                          type={showPassword ? 'text' : 'password'} 
                          placeholder="••••••••" 
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)}
                          className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {errors.password && (
                        <p className="text-sm text-red-500 mt-1 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {errors.password}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="clinic-id" className="text-sm font-medium">Clinic ID</Label>
                      <Input 
                        id="clinic-id" 
                        type="text" 
                        placeholder="CLINIC123" 
                        value={clinicId}
                        onChange={(e) => setClinicId(e.target.value)}
                        className={errors.clinicId ? 'border-red-500' : ''}
                      />
                      {errors.clinicId && (
                        <p className="text-sm text-red-500 mt-1 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {errors.clinicId}
                        </p>
                      )}
                    </div>
                  </div>
                </form>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-healthy-400 to-nature-500 hover:from-healthy-500 hover:to-nature-600" 
                  onClick={handleRealLogin} 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Sign In
                    </>
                  )}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleDemoLogin('doctor')}
                >
                  Continue as Demo Doctor
                </Button>
              </CardFooter>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Additional Actions */}
        <div className="w-full max-w-md mt-6 space-y-4">
          <div className="flex items-center justify-between text-sm">
            <Button
              variant="link"
              className="text-healthy-600 hover:text-healthy-700 p-0 h-auto"
              onClick={handleForgotPassword}
            >
              Forgot your password?
            </Button>
            
            <Button
              variant="link"
              className="text-healthy-600 hover:text-healthy-700 p-0 h-auto"
              onClick={handleRegister}
            >
              Create new account
            </Button>
          </div>

          <Separator />

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Button
                variant="link"
                className="text-healthy-600 hover:text-healthy-700 p-0 h-auto font-medium"
                onClick={handleRegister}
              >
                Register now
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </p>
          </div>
        </div>

        {/* Demo Information */}
        <div className="w-full max-w-md mt-8">
          <Alert className="bg-amber-50 border-amber-200">
            <InfoIcon className="h-4 w-4 text-amber-500 mr-2" />
            <AlertDescription className="text-sm text-amber-700">
              <strong>Demo Mode:</strong> Use the demo buttons above to explore QUANTUM HEALTH without creating an account. 
              All demo data is reset daily.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </>
  );
};

export default Login;
