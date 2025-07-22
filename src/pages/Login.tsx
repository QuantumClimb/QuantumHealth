
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import SEO from '@/components/SEO';

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const handleLogin = async () => {
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate login process
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Success",
        description: `Welcome to QUANTUM HEALTH! Redirecting to ${role} dashboard...`,
      });
      
      // Navigate to appropriate dashboard
      if (role === 'patient') {
        navigate('/patient/dashboard');
      } else {
        navigate('/doctor/dashboard');
      }
    }, 2000);
  };
  
  const handleDemoLogin = (selectedRole: 'patient' | 'doctor') => {
    setRole(selectedRole);
    // In a real app, handle demo authentication here
    if (selectedRole === 'patient') {
      navigate('/patient/dashboard');
    } else {
      navigate('/doctor/dashboard');
    }
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
              <TabsTrigger value="patient">Patient</TabsTrigger>
              <TabsTrigger value="doctor">Doctor</TabsTrigger>
            </TabsList>
            
            <TabsContent value="patient">
              <CardContent className="space-y-4 pt-4">
                <Alert className="bg-blue-50 border-blue-200">
                  <InfoIcon className="h-4 w-4 text-blue-500 mr-2" />
                  <AlertDescription className="text-sm text-blue-700">
                    <strong>Demo Patient Login</strong>
                  </AlertDescription>
                </Alert>
                
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Email</TableCell>
                        <TableCell>patient@example.com</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Password</TableCell>
                        <TableCell>password123</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                
                <form onSubmit={handleLogin}>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <Input id="email" type="email" placeholder="patient@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                    <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full bg-gradient-to-r from-healthy-400 to-nature-500 hover:from-healthy-500 hover:to-nature-600" onClick={handleLogin} disabled={isLoading}>
                  Sign In
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
                    <strong>Demo Doctor Login</strong>
                  </AlertDescription>
                </Alert>
                
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Email</TableCell>
                        <TableCell>doctor@example.com</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Password</TableCell>
                        <TableCell>doctor123</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Clinic ID</TableCell>
                        <TableCell>CLINIC123</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                
                <form onSubmit={handleLogin}>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <Input id="email" type="email" placeholder="doctor@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                    <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="clinic-id" className="text-sm font-medium">Clinic ID</Label>
                    <Input id="clinic-id" type="text" placeholder="CLINIC123" />
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full bg-gradient-to-r from-healthy-400 to-nature-500 hover:from-healthy-500 hover:to-nature-600" onClick={handleLogin} disabled={isLoading}>
                  Sign In
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
      </div>
    </>
  );
};

export default Login;
