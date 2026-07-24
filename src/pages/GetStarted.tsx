import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope, Users, Plus, ArrowRight, Trash2, ShieldCheck, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/services/supabaseService';
import { motion } from 'framer-motion';

const GetStarted: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Component mounted
  }, []);

  const handleAddDoctor = () => {
    navigate('/add-doctor');
  };

  const handleViewDoctors = () => {
    navigate('/doctors');
  };

  const handlePurgeData = async () => {
    try {
      const { error } = await supabase
        .from('quantumhealth_doctor_profiles')
        .delete()
        .eq('tenant_id', 'quantumhealth');

      if (error) throw error;

      toast({
        title: "Data Purged!",
        description: "All doctors have been removed from the database.",
      });
    } catch (error) {
      console.error('Error purging data:', error);
      toast({
        title: "Error",
        description: "Failed to purge data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans selection:bg-healthy-500/20 selection:text-healthy-700">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-blue-300/20 blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[35%] h-[35%] rounded-full bg-healthy-300/20 blur-[100px]"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-20">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm mb-6 border border-slate-100">
            <Zap className="h-8 w-8 text-healthy-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-healthy-500 to-blue-600">QuantumOS</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">
            Your clinic is ready. Let's set up your team and get you onboarded in less than 3 minutes.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
        >
          {/* Add Doctor Card */}
          <motion.div variants={itemVariants}>
            <Card className="glass-card hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full" onClick={handleAddDoctor}>
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                  <Plus className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-slate-800">Add Provider</CardTitle>
                <CardDescription className="text-slate-500 text-base">
                  Register a new doctor or specialist to your clinic's workspace.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center pt-6">
                <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-8 shadow-md">
                  <Stethoscope className="h-4 w-4 mr-2" />
                  Add Provider
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* View Doctors Card */}
          <motion.div variants={itemVariants}>
            <Card className="glass-card hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full" onClick={handleViewDoctors}>
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-healthy-400 to-emerald-500 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-slate-800">Manage Team</CardTitle>
                <CardDescription className="text-slate-500 text-base">
                  View and manage your existing healthcare providers and staff.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center pt-6">
                <Button variant="outline" className="rounded-full px-8 border-slate-200 hover:bg-slate-50 text-slate-700">
                  <Users className="h-4 w-4 mr-2" />
                  View Directory
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          <motion.div variants={itemVariants}>
            <Card className="glass-card border-none shadow-sm">
              <CardHeader className="border-b border-slate-100/50 bg-white/50 rounded-t-2xl">
                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-800">
                  <ShieldCheck className="h-5 w-5 text-healthy-500" />
                  Quick Setup Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid sm:grid-cols-3 gap-8">
                  {[
                    { num: 1, title: 'Add Providers', desc: 'Register doctors with their credentials.' },
                    { num: 2, title: 'Invite Patients', desc: 'Onboard patients to the portal.' },
                    { num: 3, title: 'Start Scheduling', desc: 'Book appointments and manage records.' }
                  ].map((step) => (
                    <div key={step.num} className="relative">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm">
                          {step.num}
                        </div>
                        <h4 className="font-semibold text-slate-800">{step.title}</h4>
                      </div>
                      <p className="text-slate-500 text-sm pl-12 leading-relaxed">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Danger Zone */}
          <motion.div variants={itemVariants}>
            <Card className="border border-red-100 bg-red-50/50 shadow-sm rounded-2xl overflow-hidden">
              <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-red-900">Developer Tools: Data Reset</h4>
                  <p className="text-red-700/70 text-sm">Clear all provider data to start with a fresh workspace.</p>
                </div>
                <Button
                  variant="outline"
                  onClick={handlePurgeData}
                  className="border-red-200 text-red-600 hover:bg-red-600 hover:text-white transition-colors bg-white w-full sm:w-auto"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Purge Data
                </Button>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default GetStarted;
