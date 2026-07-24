import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { User, Stethoscope, Save, ArrowLeft } from 'lucide-react';
import { supabase } from '@/services/supabaseService';

interface Doctor {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  specialization: string;
  license_number: string;
  experience_years: number;
  qualifications: string;
  consultation_fee: number;
  bio: string;
  created_at: string;
}

const AddDoctor: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [doctor, setDoctor] = useState<Omit<Doctor, 'id' | 'created_at'>>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    specialization: '',
    license_number: '',
    experience_years: 0,
    qualifications: '',
    consultation_fee: 0,
    bio: ''
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Insert doctor into quantumhealth_doctor_profiles table
      const { data, error } = await supabase
        .from('quantumhealth_doctor_profiles')
        .insert({
          first_name: doctor.first_name,
          last_name: doctor.last_name,
          email: doctor.email,
          phone: doctor.phone,
          specialization: doctor.specialization,
          license_number: doctor.license_number,
          experience_years: doctor.experience_years,
          qualifications: doctor.qualifications,
          consultation_fee: doctor.consultation_fee,
          bio: doctor.bio,
          tenant_id: 'quantumhealth', // Default tenant for now
          is_active: true
        })
        .select()
        .single();

      if (error) {
        throw error;
      }
      
      toast({
        title: "Doctor Added!",
        description: `Dr. ${doctor.last_name} has been successfully added to the system.`,
      });

      // Navigate to doctors list
      navigate('/doctors');
    } catch (error) {
      console.error('Error adding doctor:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add doctor. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof Omit<Doctor, 'id' | 'created_at'>, value: string | number) => {
    setDoctor(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Get Started
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text mb-2">
            Add New Doctor
          </h1>
          <p className="text-gray-600 text-lg">Register a healthcare provider to your system</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-4">
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Doctor Information</CardTitle>
            <CardDescription>
              Fill in the doctor's personal and professional details
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <span>Personal Information</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={doctor.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      placeholder="John"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={doctor.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      placeholder="Smith"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={doctor.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="doctor@example.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={doctor.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <Stethoscope className="h-5 w-5 text-blue-600" />
                  <span>Professional Information</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="specialization">Specialization</Label>
                    <Select value={doctor.specialization} onValueChange={(value) => handleInputChange('specialization', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select specialization" />
                      </SelectTrigger>
                      <SelectContent>
                        {specializations.map((spec) => (
                          <SelectItem key={spec} value={spec}>
                            {spec}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="license_number">License Number</Label>
                    <Input
                      id="license_number"
                      value={doctor.license_number}
                      onChange={(e) => handleInputChange('license_number', e.target.value)}
                      placeholder="MD123456"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="experience_years">Years of Experience</Label>
                    <Input
                      id="experience_years"
                      type="number"
                      value={doctor.experience_years}
                      onChange={(e) => handleInputChange('experience_years', parseInt(e.target.value) || 0)}
                      placeholder="5"
                      min="0"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="consultation_fee">Consultation Fee ($)</Label>
                    <Input
                      id="consultation_fee"
                      type="number"
                      value={doctor.consultation_fee}
                      onChange={(e) => handleInputChange('consultation_fee', parseInt(e.target.value) || 0)}
                      placeholder="150"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="qualifications">Qualifications</Label>
                  <Input
                    id="qualifications"
                    value={doctor.qualifications}
                    onChange={(e) => handleInputChange('qualifications', e.target.value)}
                    placeholder="MBBS, MD, Board Certified"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Professional Bio</Label>
                  <Textarea
                    id="bio"
                    value={doctor.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell us about the doctor's medical background, expertise, and approach to patient care..."
                    rows={4}
                    required
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  disabled={isLoading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Adding Doctor...' : 'Add Doctor'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddDoctor;
