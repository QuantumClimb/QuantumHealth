import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Stethoscope, Plus, Users, ArrowLeft, Calendar, DollarSign, Phone, Mail } from 'lucide-react';
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

const DoctorsList: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('quantumhealth_doctor_profiles')
        .select('*')
        .eq('tenant_id', 'quantumhealth')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setDoctors(data || []);
    } catch (error) {
      console.error('Error loading doctors:', error);
      toast({
        title: "Error",
        description: "Failed to load doctors.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddDoctor = () => {
    navigate('/add-doctor');
  };

  const handleViewDoctor = (doctorId: string) => {
    navigate(`/doctor/${doctorId}`);
  };

  const handleAddPatient = (doctorId: string) => {
    navigate(`/add-patient/${doctorId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading doctors...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Get Started
            </Button>
          </div>
          <Button
            onClick={handleAddDoctor}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Doctor
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text mb-2">
            Doctors
          </h1>
          <p className="text-gray-600 text-lg">
            {doctors.length === 0 
              ? "No doctors added yet. Add your first doctor to get started."
              : `Managing ${doctors.length} doctor${doctors.length === 1 ? '' : 's'}`
            }
          </p>
        </div>

        {doctors.length === 0 ? (
          <Card className="shadow-xl">
            <CardContent className="text-center py-12">
              <div className="mx-auto w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <Stethoscope className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Doctors Yet</h3>
              <p className="text-gray-500 mb-6">
                Start by adding your first healthcare provider to the system.
              </p>
              <Button
                onClick={handleAddDoctor}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                size="lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Doctor
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <Card key={doctor.id} className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">
                        Dr. {doctor.first_name} {doctor.last_name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {doctor.specialization}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      {doctor.experience_years} years
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      {doctor.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      {doctor.phone}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2" />
                      ${doctor.consultation_fee} consultation fee
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      Added {formatDate(doctor.created_at)}
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {doctor.bio || "No bio available"}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDoctor(doctor.id)}
                      className="flex-1"
                    >
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleAddPatient(doctor.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <Users className="h-4 w-4 mr-1" />
                      Add Patient
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorsList;
