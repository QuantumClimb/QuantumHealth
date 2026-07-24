/**
 * Doctor Registration Component
 * Simple single-step registration form for new doctors
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/services/supabaseService';
import { DoctorRegistrationData } from '@/services/authService';
import { User, Shield, Stethoscope } from 'lucide-react';

interface DoctorRegistrationProps {
  onSuccess?: (user: unknown) => void;
  onCancel?: () => void;
}

const DoctorRegistration: React.FC<DoctorRegistrationProps> = ({ onSuccess, onCancel }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Form state
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<DoctorRegistrationData>({
    first_name: '',
    last_name: '',
    phone: '',
    clinic_name: '',
    specialization: '',
    license_number: '',
    experience_years: 0,
    qualifications: [],
    consultation_fee: 0,
    availability: {}
  });

  // Credentials state
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Specialization options
  const specializations = [
    'Cardiology',
    'Dermatology',
    'Endocrinology',
    'Gastroenterology',
    'General Practice',
    'Neurology',
    'Oncology',
    'Orthopedics',
    'Pediatrics',
    'Psychiatry',
    'Radiology',
    'Surgery',
    'Other'
  ];

  // Validation functions
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate credentials
    if (!credentials.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!credentials.password) {
      newErrors.password = 'Password is required';
    } else if (credentials.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (credentials.password !== credentials.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Simple Supabase auth registration - no email confirmation
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            role: 'doctor'
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        toast({
          title: "Registration Successful!",
          description: `Welcome to QUANTUM HEALTH! Your account has been created successfully.`,
        });

        if (onSuccess) {
          onSuccess({ 
            id: data.user.id, 
            email: credentials.email, 
            role: 'doctor' 
          });
        } else {
          navigate('/pending-approval');
        }
      }
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white to-gray-50 p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-healthy-400 to-nature-500 text-transparent bg-clip-text mb-2">
            QUANTUM HEALTH
          </h1>
          <p className="text-gray-600 text-lg">Doctor Registration</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-healthy-400 to-nature-500 rounded-full flex items-center justify-center mb-4">
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Doctor Registration</CardTitle>
            <CardDescription>
              Create your professional healthcare provider account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Account Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <User className="h-5 w-5 text-healthy-500" />
                  <span>Create Your Account</span>
                </h3>
                
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="doctor@example.com"
                    value={credentials.email}
                    onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    className={errors.password ? 'border-red-500' : ''}
                  />
                  {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={credentials.confirmPassword}
                    onChange={(e) => setCredentials({ ...credentials, confirmPassword: e.target.value })}
                    className={errors.confirmPassword ? 'border-red-500' : ''}
                  />
                  {errors.confirmPassword && <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>}
                </div>

                <Alert className="bg-blue-50 border-blue-200">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <AlertDescription className="text-sm text-blue-700">
                    Your password must be at least 8 characters long. Account will be activated immediately.
                  </AlertDescription>
                </Alert>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-healthy-400 to-nature-500 hover:from-healthy-500 hover:to-nature-600"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DoctorRegistration; 