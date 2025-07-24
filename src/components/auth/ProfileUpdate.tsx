/**
 * Profile Update Component
 * Allows users to update their profile information
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { authService, AuthUser, PatientProfile, DoctorProfile } from '@/services/authService';
import { User, Stethoscope, Save, X, CheckCircle } from 'lucide-react';

interface ProfileUpdateProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ProfileUpdate: React.FC<ProfileUpdateProps> = ({ onSuccess, onCancel }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [formData, setFormData] = useState<Partial<PatientProfile & DoctorProfile>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setFormData(currentUser.profile || {});
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load user profile",
        variant: "destructive",
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name?.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.last_name?.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    // Doctor-specific validation
    if (user?.role === 'doctor') {
      const doctorProfile = formData as DoctorProfile;
      if (!doctorProfile.specialization?.trim()) {
        newErrors.specialization = 'Specialization is required';
      }
      if (!doctorProfile.license_number?.trim()) {
        newErrors.license_number = 'License number is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const success = await authService.updateProfile(formData);
      
      if (success) {
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully",
        });
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-healthy-500"></div>
      </div>
    );
  }

  const isDoctor = user.role === 'doctor';

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-2 mb-4">
            {isDoctor ? (
              <Stethoscope className="h-6 w-6 text-healthy-500" />
            ) : (
              <User className="h-6 w-6 text-healthy-500" />
            )}
            <div>
              <CardTitle className="text-2xl">
                {isDoctor ? 'Doctor' : 'Patient'} Profile Update
              </CardTitle>
              <CardDescription>
                Update your personal and professional information
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  placeholder="John"
                  value={formData.first_name || ''}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className={errors.first_name ? 'border-red-500' : ''}
                />
                {errors.first_name && <p className="text-sm text-red-500 mt-1">{errors.first_name}</p>}
              </div>

              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  placeholder={isDoctor ? "Smith" : "Doe"}
                  value={formData.last_name || ''}
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
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
            </div>

            {isDoctor && (
              <div>
                <Label htmlFor="clinic_name">Clinic/Hospital Name</Label>
                <Input
                  id="clinic_name"
                  placeholder="City General Hospital"
                  value={(formData as DoctorProfile).clinic_name || ''}
                  onChange={(e) => setFormData({ ...formData, clinic_name: e.target.value })}
                />
              </div>
            )}
          </div>

          {/* Professional Information (Doctors Only) */}
          {isDoctor && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Professional Information</h3>
              
              <div>
                <Label htmlFor="specialization">Specialization</Label>
                <Select
                  value={(formData as DoctorProfile).specialization || ''}
                  onValueChange={(value) => setFormData({ ...formData, specialization: value })}
                >
                  <SelectTrigger className={errors.specialization ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select your specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      'Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology',
                      'General Practice', 'Neurology', 'Oncology', 'Orthopedics',
                      'Pediatrics', 'Psychiatry', 'Radiology', 'Surgery', 'Other'
                    ].map((spec) => (
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
                    value={(formData as DoctorProfile).license_number || ''}
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
                    value={(formData as DoctorProfile).experience_years || 0}
                    onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="qualifications">Qualifications (comma-separated)</Label>
                <Input
                  id="qualifications"
                  placeholder="MBBS, MD, FACS"
                  value={(formData as DoctorProfile).qualifications?.join(', ') || ''}
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
                  value={(formData as DoctorProfile).consultation_fee || 0}
                  onChange={(e) => setFormData({ ...formData, consultation_fee: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          )}

          {/* Medical Information (Patients Only) */}
          {!isDoctor && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Medical Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={(formData as PatientProfile).date_of_birth || ''}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={(formData as PatientProfile).gender || 'prefer_not_to_say'}
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
                <Label htmlFor="allergies">Allergies (comma-separated)</Label>
                <Input
                  id="allergies"
                  placeholder="Peanuts, Penicillin, Latex"
                  value={(formData as PatientProfile).allergies?.join(', ') || ''}
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
                  value={(formData as PatientProfile).medications?.join(', ') || ''}
                  onChange={(e) => {
                    const medications = e.target.value.split(',').map(item => item.trim()).filter(Boolean);
                    setFormData({ ...formData, medications });
                  }}
                />
              </div>
            </div>
          )}

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Information</h3>
            
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

            {!isDoctor && (
              <div>
                <Label htmlFor="emergency_contact">Emergency Contact</Label>
                <Textarea
                  id="emergency_contact"
                  placeholder="Name, relationship, and phone number"
                  value={JSON.stringify((formData as PatientProfile).emergency_contact || {}, null, 2)}
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
            )}

            {isDoctor && (
              <div>
                <Label htmlFor="availability">Availability Schedule</Label>
                <Textarea
                  id="availability"
                  placeholder="Enter your availability schedule (e.g., Mon-Fri 9AM-5PM)"
                  value={JSON.stringify((formData as DoctorProfile).availability || {}, null, 2)}
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
            )}
          </div>

          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription className="text-sm text-blue-700">
              All information is kept secure and confidential. Updates are saved immediately.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-gradient-to-r from-healthy-400 to-nature-500 hover:from-healthy-500 hover:to-nature-600"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Profile
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileUpdate; 