import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import PatientRegistration from './PatientRegistration';
import DoctorRegistration from './DoctorRegistration';
import { User, Stethoscope, ArrowLeft, CheckCircle, Shield, Clock, Users, FileText, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

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
      if (onCancel) onCancel();
      else navigate('/login');
    } else {
      setRegistrationType('selector');
    }
  };

  const handleSuccess = (user: unknown) => {
    if (onSuccess) onSuccess(user);
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    else navigate('/login');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (registrationType === 'selector') {
    return (
      <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-healthy-500/20 selection:text-healthy-700">
        
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-blue-300/20 blur-[100px] animate-blob"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[35%] h-[35%] rounded-full bg-healthy-300/20 blur-[100px] animate-blob" style={{ animationDelay: '2s' }}></div>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-5xl mx-auto"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm mb-6 border border-slate-100">
              <Activity className="h-8 w-8 text-healthy-500" />
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
              Join <span className="text-transparent bg-clip-text bg-gradient-to-r from-healthy-500 to-blue-600">QuantumOS</span>
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Select your account type to begin your digital healthcare journey.
            </p>
          </motion.div>

          {/* Registration Options */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Patient Registration Card */}
            <motion.div variants={itemVariants} className="h-full">
              <Card className="glass-card hover:-translate-y-1 transition-all duration-300 border-white/60 shadow-xl h-full flex flex-col">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm text-white">
                    <User className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-slate-800">Patient Account</CardTitle>
                  <CardDescription className="text-slate-500 text-base">
                    Access your medical records, book appointments, and chat with your doctors.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="space-y-4 flex-1 mb-8">
                    {[
                      { icon: CheckCircle, text: 'Book and manage appointments' },
                      { icon: FileText, text: 'Access all medical reports' },
                      { icon: Users, text: 'Secure messaging with doctors' },
                      { icon: Shield, text: 'HIPAA-compliant data protection' }
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center space-x-3 text-slate-700">
                        <feature.icon className="h-5 w-5 text-blue-500 shrink-0" />
                        <span className="text-sm font-medium">{feature.text}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button
                    onClick={() => setRegistrationType('patient')}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-full h-12 shadow-md transition-all hover:shadow-lg"
                  >
                    Create Patient Account
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Doctor Registration Card */}
            <motion.div variants={itemVariants} className="h-full">
              <Card className="glass-card hover:-translate-y-1 transition-all duration-300 border-white/60 shadow-xl h-full flex flex-col">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-healthy-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-4 shadow-sm text-white">
                    <Stethoscope className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-slate-800">Provider Account</CardTitle>
                  <CardDescription className="text-slate-500 text-base">
                    Manage your practice, see patients, and issue digital prescriptions.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="space-y-4 flex-1 mb-8">
                    {[
                      { icon: Users, text: 'Manage patient roster' },
                      { icon: FileText, text: 'Create digital medical reports' },
                      { icon: Clock, text: 'Set schedule and availability' },
                      { icon: Shield, text: 'Secure clinical communication' }
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center space-x-3 text-slate-700">
                        <feature.icon className="h-5 w-5 text-healthy-500 shrink-0" />
                        <span className="text-sm font-medium">{feature.text}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button
                    onClick={() => setRegistrationType('doctor')}
                    className="w-full bg-healthy-600 hover:bg-healthy-700 text-white rounded-full h-12 shadow-md transition-all hover:shadow-lg"
                  >
                    Create Provider Account
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div variants={itemVariants} className="text-center">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 rounded-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Sign In
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Sub-registration forms layout wrapper
  return (
    <div className="min-h-screen bg-slate-50 selection:bg-healthy-500/20 selection:text-healthy-700">
      <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={handleBack} className="text-slate-600 hover:text-slate-900 rounded-full">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-healthy-600" />
                <h1 className="text-lg font-bold text-slate-900">QuantumOS</h1>
                <span className="text-slate-400 text-sm ml-2 font-medium">
                  / {registrationType === 'patient' ? 'Patient Setup' : 'Provider Setup'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-12 px-4"
      >
        {registrationType === 'patient' && <PatientRegistration onSuccess={handleSuccess} onCancel={handleCancel} />}
        {registrationType === 'doctor' && <DoctorRegistration onSuccess={handleSuccess} onCancel={handleCancel} />}
      </motion.div>
    </div>
  );
};

export default RegistrationSelector;