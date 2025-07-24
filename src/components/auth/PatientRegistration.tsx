/**
 * Patient Registration Component
 * Multi-step registration form for new patients
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { authService, PatientRegistrationData } from '@/services/authService';
import { ChevronLeft, ChevronRight, User, Shield, FileText, CheckCircle } from 'lucide-react';

interface PatientRegistrationProps {
  onSuccess?: (user: unknown) => void;
  onCancel?: () => void;
}

const PatientRegistration: React.FC<PatientRegistrationProps> = ({ onSuccess, onCancel }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Form state
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<PatientRegistrationData>({
    first_name: '',
    last_name: '',
    phone: '',
    date_of_birth: '',
    gender: 'prefer_not_to_say',
    address: {},
    emergency_contact: {},
    medical_history: {},
    allergies: [],
    medications: []
  });

  // Credentials state
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalSteps = 4;

  // Step titles
  const stepTitles = [
    'Account Information',
    'Personal Details',
    'Medical Information',
    'Review & Submit'
  ];

  // Validation functions
  const validateCredentials = () => {
    const newErrors: Record<string, string> = {};

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

  const validatePersonalDetails = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation functions
  const nextStep = () => {
    if (step === 1 && !validateCredentials()) return;
    if (step === 2 && !validatePersonalDetails()) return;
    
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Form submission
  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      const user = await authService.registerUser({
        email: credentials.email,
        password: credentials.password,
        role: 'patient',
        profile: formData
      });

      if (user) {
        toast({
          title: "Registration Successful!",
          description: `Welcome to QUANTUM HEALTH, ${user.profile?.first_name}!`,
        });

        if (onSuccess) {
          onSuccess(user);
        } else {
          navigate('/patient/dashboard');
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

  // Render step content
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="patient@example.com"
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
              <AlertDescription className="text-sm text-blue-700">
                Your password must be at least 8 characters long and contain a mix of letters, numbers, and symbols.
              </AlertDescription>
            </Alert>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  placeholder="John"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className={errors.first_name ? 'border-red-500' : ''}
                />
                {errors.first_name && <p className="text-sm text-red-500 mt-1">{errors.first_name}</p>}
              </div>

              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  placeholder="Doe"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className={errors.last_name ? 'border-red-500' : ''}
                />
                {errors.last_name && <p className="text-sm text-red-500 mt-1">{errors.last_name}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value as 'male' | 'female' | 'other' | 'prefer_not_to_say' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                placeholder="Enter your full address"
                value={JSON.stringify(formData.address || {}, null, 2)}
                onChange={(e) => {
                  try {
                    const address = JSON.parse(e.target.value);
                    setFormData({ ...formData, address });
                  } catch {
                    // Ignore invalid JSON
                  }
                }}
                rows={3}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="emergency_contact">Emergency Contact</Label>
              <Textarea
                id="emergency_contact"
                placeholder="Name, relationship, and phone number"
                value={JSON.stringify(formData.emergency_contact || {}, null, 2)}
                onChange={(e) => {
                  try {
                    const emergency_contact = JSON.parse(e.target.value);
                    setFormData({ ...formData, emergency_contact });
                  } catch {
                    // Ignore invalid JSON
                  }
                }}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="allergies">Allergies (comma-separated)</Label>
              <Input
                id="allergies"
                placeholder="Peanuts, Penicillin, Latex"
                value={formData.allergies?.join(', ') || ''}
                onChange={(e) => {
                  const allergies = e.target.value.split(',').map(item => item.trim()).filter(Boolean);
                  setFormData({ ...formData, allergies });
                }}
              />
            </div>

            <div>
              <Label htmlFor="medications">Current Medications (comma-separated)</Label>
              <Input
                id="medications"
                placeholder="Aspirin, Vitamin D, Metformin"
                value={formData.medications?.join(', ') || ''}
                onChange={(e) => {
                  const medications = e.target.value.split(',').map(item => item.trim()).filter(Boolean);
                  setFormData({ ...formData, medications });
                }}
              />
            </div>

            <div>
              <Label htmlFor="medical_history">Medical History</Label>
              <Textarea
                id="medical_history"
                placeholder="Any relevant medical history, conditions, or surgeries"
                value={JSON.stringify(formData.medical_history || {}, null, 2)}
                onChange={(e) => {
                  try {
                    const medical_history = JSON.parse(e.target.value);
                    setFormData({ ...formData, medical_history });
                  } catch {
                    // Ignore invalid JSON
                  }
                }}
                rows={4}
              />
            </div>

            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-sm text-green-700">
                This information helps us provide better care. All data is kept confidential and secure.
              </AlertDescription>
            </Alert>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3">Account Information</h4>
              <p><strong>Email:</strong> {credentials.email}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3">Personal Details</h4>
              <p><strong>Name:</strong> {formData.first_name} {formData.last_name}</p>
              <p><strong>Phone:</strong> {formData.phone}</p>
              <p><strong>Date of Birth:</strong> {formData.date_of_birth}</p>
              <p><strong>Gender:</strong> {formData.gender}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3">Medical Information</h4>
              <p><strong>Allergies:</strong> {formData.allergies?.length ? formData.allergies.join(', ') : 'None listed'}</p>
              <p><strong>Medications:</strong> {formData.medications?.length ? formData.medications.join(', ') : 'None listed'}</p>
            </div>

            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-sm text-blue-700">
                Please review your information carefully. You can go back to make changes if needed.
              </AlertDescription>
            </Alert>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-2 mb-4">
            <User className="h-6 w-6 text-healthy-500" />
            <div>
              <CardTitle className="text-2xl">Patient Registration</CardTitle>
              <CardDescription>
                Step {step} of {totalSteps}: {stepTitles[step - 1]}
              </CardDescription>
            </div>
          </div>

          <Progress value={(step / totalSteps) * 100} className="w-full" />
        </CardHeader>

        <CardContent className="space-y-6">
          {renderStepContent()}

          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={step === 1 ? onCancel : prevStep}
              disabled={isLoading}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              {step === 1 ? 'Cancel' : 'Previous'}
            </Button>

            <div className="flex space-x-2">
              {step < totalSteps ? (
                <Button
                  onClick={nextStep}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-healthy-400 to-nature-500 hover:from-healthy-500 hover:to-nature-600"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-healthy-400 to-nature-500 hover:from-healthy-500 hover:to-nature-600"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Create Account
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientRegistration; 