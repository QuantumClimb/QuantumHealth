/**
 * Registration Selector Component
 * Allows users to choose between patient and doctor registration
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import PatientRegistration from './PatientRegistration';
import DoctorRegistration from './DoctorRegistration';
import { User, Stethoscope, ArrowLeft, CheckCircle, Shield, Clock, Users, FileText } from 'lucide-react';

interface RegistrationSelectorProps {
  onSuccess?: (user: unknown) => void;
  onCancel?: () => void;
}

type RegistrationType = 'selector' | 'patient' | 'doctor';

const RegistrationSelector: React.FC<RegistrationSelectorProps> = ({ onSuccess, onCancel }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [registrationType, setRegistrationType] = useState<RegistrationType>('selector');

  const handleBack = () => {
    if (registrationType === 'selector') {
      if (onCancel) {
        onCancel();
      } else {
        navigate('/login');
      }
    } else {
      setRegistrationType('selector');
    }
  };

  const handleSuccess = (user: unknown) => {
    if (onSuccess) {
      onSuccess(user);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/login');
    }
  };

  // Render registration type selector
  if (registrationType === 'selector') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white to-gray-50 p-4">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-healthy-400 to-nature-500 text-transparent bg-clip-text mb-2">
              QUANTUM HEALTH
            </h1>
            <p className="text-gray-600 text-lg">Choose your registration type</p>
          </div>

          {/* Registration Options */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Patient Registration Card */}
            <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer border-2 hover:border-healthy-200">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-healthy-400 to-nature-500 rounded-full flex items-center justify-center mb-4">
                  <User className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Patient Registration</CardTitle>
                <CardDescription>
                  Join QUANTUM HEALTH as a patient to access healthcare services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Book appointments with doctors</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Manage medical reports</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Secure messaging with healthcare providers</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span className="text-sm">HIPAA-compliant data protection</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="text-center">
                    <Badge variant="secondary" className="mb-2">
                      Free Registration
                    </Badge>
                    <p className="text-xs text-gray-500">
                      No fees to create your patient account
                    </p>
                  </div>
                </div>
                
                <Button
                  onClick={() => setRegistrationType('patient')}
                  className="w-full mt-6 bg-gradient-to-r from-healthy-400 to-nature-500 hover:from-healthy-500 hover:to-nature-600"
                >
                  Register as Patient
                </Button>
              </CardContent>
            </Card>

            {/* Doctor Registration Card */}
            <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer border-2 hover:border-healthy-200">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-healthy-400 to-nature-500 rounded-full flex items-center justify-center mb-4">
                  <Stethoscope className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Doctor Registration</CardTitle>
                <CardDescription>
                  Join QUANTUM HEALTH as a healthcare provider
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Manage patient appointments</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Create and manage medical reports</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Set your availability schedule</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Secure patient communication</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="text-center">
                    <Badge variant="secondary" className="mb-2">
                      Professional Account
                    </Badge>
                    <p className="text-xs text-gray-500">
                      Verified medical credentials required
                    </p>
                  </div>
                </div>
                
                <Button
                  onClick={() => setRegistrationType('doctor')}
                  className="w-full mt-6 bg-gradient-to-r from-healthy-400 to-nature-500 hover:from-healthy-500 hover:to-nature-600"
                >
                  Register as Doctor
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Login</span>
            </Button>
          </div>

          {/* Features Overview */}
          <div className="mt-12 bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-center mb-4">Why Choose QUANTUM HEALTH?</h3>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div>
                <Shield className="h-8 w-8 text-healthy-500 mx-auto mb-2" />
                <h4 className="font-medium">Secure & Private</h4>
                <p className="text-sm text-gray-600">HIPAA-compliant data protection</p>
              </div>
              <div>
                <Clock className="h-8 w-8 text-healthy-500 mx-auto mb-2" />
                <h4 className="font-medium">24/7 Access</h4>
                <p className="text-sm text-gray-600">Access your health data anytime</p>
              </div>
              <div>
                <Users className="h-8 w-8 text-healthy-500 mx-auto mb-2" />
                <h4 className="font-medium">Connected Care</h4>
                <p className="text-sm text-gray-600">Seamless patient-doctor communication</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render specific registration form
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={handleBack}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-xl font-semibold bg-gradient-to-r from-healthy-400 to-nature-500 text-transparent bg-clip-text">
                  QUANTUM HEALTH
                </h1>
                <p className="text-sm text-gray-500">
                  {registrationType === 'patient' ? 'Patient Registration' : 'Doctor Registration'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Form */}
      <div className="py-8">
        {registrationType === 'patient' && (
          <PatientRegistration
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        )}
        {registrationType === 'doctor' && (
          <DoctorRegistration
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
};

export default RegistrationSelector; 