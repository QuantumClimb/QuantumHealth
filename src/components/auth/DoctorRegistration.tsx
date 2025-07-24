/**
 * Doctor Registration Component
 * Multi-step registration form for new doctors
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { authService, DoctorRegistrationData } from '@/services/authService';
import { ChevronLeft, ChevronRight, User, Shield, FileText, CheckCircle, Stethoscope } from 'lucide-react';

interface DoctorRegistrationProps {
  onSuccess?: (user: unknown) => void;
  onCancel?: () => void;
}

const DoctorRegistration: React.FC<DoctorRegistrationProps> = ({ onSuccess, onCancel }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Form state
  const [step, setStep] = useState(1);
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

  const totalSteps = 4;

  // Step titles
  const stepTitles = [
    'Account Information',
    'Personal Details',
    'Professional Information',
    'Review & Submit'
  ];

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

  const validateProfessionalDetails = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.specialization.trim()) {
      newErrors.specialization = 'Specialization is required';
    }

    if (!formData.license_number.trim()) {
      newErrors.license_number = 'License number is required';
    }

    if (formData.experience_years < 0) {
      newErrors.experience_years = 'Experience years cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation functions
  const nextStep = () => {
    if (step === 1 && !validateCredentials()) return;
    if (step === 2 && !validatePersonalDetails()) return;
    if (step === 3 && !validateProfessionalDetails()) return;
    
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
        role: 'doctor',
        profile: formData
      });

      if (user) {
        toast({
          title: "Registration Successful!",
          description: `Welcome to QUANTUM HEALTH, Dr. ${user.profile?.last_name}!`,
        });

        if (onSuccess) {
          onSuccess(user);
        } else {
          navigate('/doctor/dashboard');
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
                  placeholder="Smith"
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

            <div>
              <Label htmlFor="clinic_name">Clinic/Hospital Name</Label>
              <Input
                id="clinic_name"
                placeholder="City General Hospital"
                value={formData.clinic_name}
                onChange={(e) => setFormData({ ...formData, clinic_name: e.target.value })}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="specialization">Specialization</Label>
              <Select
                value={formData.specialization}
                onValueChange={(value) => setFormData({ ...formData, specialization: value })}
              >
                <SelectTrigger className={errors.specialization ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select your specialization" />
                </SelectTrigger>
                <SelectContent>
                  {specializations.map((spec) => (
                    <SelectItem key={spec} value={spec}>
                      {spec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.specialization && <p className="text-sm text-red-500 mt-1">{errors.specialization}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="license_number">Medical License Number</Label>
                <Input
                  id="license_number"
                  placeholder="MD123456"
                  value={formData.license_number}
                  onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                  className={errors.license_number ? 'border-red-500' : ''}
                />
                {errors.license_number && <p className="text-sm text-red-500 mt-1">{errors.license_number}</p>}
              </div>

              <div>
                <Label htmlFor="experience_years">Years of Experience</Label>
                <Input
                  id="experience_years"
                  type="number"
                  min="0"
                  placeholder="5"
                  value={formData.experience_years}
                  onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                  className={errors.experience_years ? 'border-red-500' : ''}
                />
                {errors.experience_years && <p className="text-sm text-red-500 mt-1">{errors.experience_years}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="qualifications">Qualifications (comma-separated)</Label>
              <Input
                id="qualifications"
                placeholder="MBBS, MD, FACS"
                value={formData.qualifications?.join(', ') || ''}
                onChange={(e) => {
                  const qualifications = e.target.value.split(',').map(item => item.trim()).filter(Boolean);
                  setFormData({ ...formData, qualifications });
                }}
              />
            </div>

            <div>
              <Label htmlFor="consultation_fee">Consultation Fee (USD)</Label>
              <Input
                id="consultation_fee"
                type="number"
                min="0"
                step="0.01"
                placeholder="150.00"
                value={formData.consultation_fee}
                onChange={(e) => setFormData({ ...formData, consultation_fee: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div>
              <Label htmlFor="availability">Availability Schedule</Label>
              <Textarea
                id="availability"
                placeholder="Enter your availability schedule (e.g., Mon-Fri 9AM-5PM)"
                value={JSON.stringify(formData.availability || {}, null, 2)}
                onChange={(e) => {
                  try {
                    const availability = JSON.parse(e.target.value);
                    setFormData({ ...formData, availability });
                  } catch {
                    // Ignore invalid JSON
                  }
                }}
                rows={3}
              />
            </div>

            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-sm text-green-700">
                This information helps patients find and book appointments with you. All data is kept secure.
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
              <p><strong>Name:</strong> Dr. {formData.first_name} {formData.last_name}</p>
              <p><strong>Phone:</strong> {formData.phone}</p>
              <p><strong>Clinic:</strong> {formData.clinic_name}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3">Professional Information</h4>
              <p><strong>Specialization:</strong> {formData.specialization}</p>
              <p><strong>License:</strong> {formData.license_number}</p>
              <p><strong>Experience:</strong> {formData.experience_years} years</p>
              <p><strong>Qualifications:</strong> {formData.qualifications?.length ? formData.qualifications.join(', ') : 'None listed'}</p>
              <p><strong>Consultation Fee:</strong> ${formData.consultation_fee}</p>
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
            <Stethoscope className="h-6 w-6 text-healthy-500" />
            <div>
              <CardTitle className="text-2xl">Doctor Registration</CardTitle>
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

export default DoctorRegistration; 