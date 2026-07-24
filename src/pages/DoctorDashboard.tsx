import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, FileText, ChevronRight, MessageCircle, Phone, Activity } from 'lucide-react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

// Enhanced sample data - in a real app, this would come from API
const todayAppointments = [
  { 
    id: 1, 
    patient: 'Sarah Johnson', 
    time: '09:00 AM', 
    type: 'Dentistry', 
    status: 'Confirmed',
    phone: '+14155552672',
    notes: 'Regular checkup and cleaning',
    history: 'Last visit: Jan 15, 2025 - Filling on lower right molar'
  },
  { 
    id: 2, 
    patient: 'Michael Brown', 
    time: '10:30 AM', 
    type: 'Dentistry', 
    status: 'In progress',
    phone: '+14155552673',
    notes: 'Follow-up on root canal',
    history: 'Last visit: Mar 22, 2025 - Root canal initial treatment'
  },
  { 
    id: 3, 
    patient: 'Emily Davis', 
    time: '02:00 PM', 
    type: 'Dentistry', 
    status: 'Upcoming',
    phone: '+14155552674',
    notes: 'Wisdom tooth consultation',
    history: 'New patient'
  },
];

const pendingReports = [
  { 
    id: 1, 
    patient: 'Sarah Johnson', 
    type: 'X-Ray Results', 
    date: 'April 7, 2025',
    priority: 'High',
    appointmentDate: 'April 3, 2025'
  },
  { 
    id: 2, 
    patient: 'Robert Wilson', 
    type: 'Blood Test', 
    date: 'April 6, 2025',
    priority: 'Medium',
    appointmentDate: 'April 1, 2025'
  },
];

const patientStats = {
  total: 128,
  new: 3,
  upcoming: 5
};

const createWhatsAppUrl = (phone: string, appointment: any) => {
  const message = encodeURIComponent(
    `Hello ${appointment.patient}, this is Dr. Rodriguez from Healthy Clinic regarding your ${appointment.type} appointment scheduled for today at ${appointment.time}. Please confirm if you'll be attending. Thank you!`
  );
  return `https://wa.me/${phone}?text=${message}`;
};

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doctorProfile, setDoctorProfile] = useState<any>(null);

  useEffect(() => {
    // Check if doctor profile exists
    const profile = localStorage.getItem('doctorProfile');
    if (!profile) {
      // Create a mock profile if bypassing real setup in demo
      const mockProfile = { first_name: 'Jane', last_name: 'Doe' };
      setDoctorProfile(mockProfile);
      return;
    }
    setDoctorProfile(JSON.parse(profile));
  }, [navigate]);

  if (!doctorProfile) {
    return (
      <Layout userRole="doctor">
         <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-healthy-500 animate-spin mb-4"></div>
              <h2 className="text-xl font-semibold text-slate-800">Loading Workspace...</h2>
            </div>
         </div>
      </Layout>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Layout userRole="doctor">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full">
        <motion.header variants={itemVariants} className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome, Dr. {doctorProfile.last_name}</h1>
          <p className="text-slate-500 mt-1">Here is a quick overview of your workspace today.</p>
        </motion.header>

        {/* Stats Cards */}
        <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div variants={itemVariants}>
            <Card className="glass-card border-white/60 shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-2">
                   <Calendar className="h-4 w-4 text-blue-500" />
                   Today's Appointments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-slate-900">{todayAppointments.length}</span>
                  <span className="text-sm font-medium text-slate-500">Scheduled</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Card className="glass-card border-white/60 shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-2">
                  <FileText className="h-4 w-4 text-amber-500" />
                  Pending Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-slate-900">{pendingReports.length}</span>
                  <span className="text-sm font-medium text-slate-500">Requires Action</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Card className="glass-card border-white/60 shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-24 h-24 bg-healthy-500/10 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-2">
                  <Users className="h-4 w-4 text-healthy-500" />
                  Total Patients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-slate-900">{patientStats.total}</span>
                  <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-100 font-bold px-2 py-0.5 relative -top-2">
                    +{patientStats.new} this week
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Schedule */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="glass-card shadow-sm border-white/60">
              <CardHeader className="pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-500" />
                  </div>
                  Today's Schedule
                </CardTitle>
                <Badge variant="outline" className="bg-slate-50 text-slate-600 font-semibold border-slate-200">
                  April 7, 2025
                </Badge>
              </CardHeader>
              <CardContent className="p-0">
                {todayAppointments.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {todayAppointments.map(appointment => (
                      <div key={appointment.id} className="p-6 hover:bg-white/60 transition-colors group">
                        <div className="flex flex-col sm:flex-row gap-4 justify-between">
                           <div className="flex gap-4">
                              <div className="flex flex-col items-center justify-center bg-slate-50 border border-slate-100 rounded-xl w-20 h-20 shrink-0 shadow-sm">
                                <span className="text-xl font-bold text-slate-800 leading-none">{appointment.time.split(' ')[0]}</span>
                                <span className="text-xs font-semibold text-slate-500 uppercase mt-1">{appointment.time.split(' ')[1]}</span>
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                   {appointment.patient}
                                   <Badge variant="secondary" className={`text-xs ${
                                     appointment.status === 'Confirmed' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                                     appointment.status === 'In progress' ? 'bg-healthy-50 text-healthy-700 border-healthy-200' : 
                                     'bg-slate-100 text-slate-700 border-slate-200'
                                   }`}>
                                     {appointment.status}
                                   </Badge>
                                </h4>
                                <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-1">
                                   <Activity className="h-3 w-3" /> {appointment.type}
                                </p>
                                <div className="mt-3 text-sm text-slate-600 space-y-1">
                                  <p className="flex gap-2">
                                     <span className="font-semibold text-slate-700">Note:</span> {appointment.notes}
                                  </p>
                                  <p className="flex gap-2">
                                     <span className="font-semibold text-slate-700">History:</span> {appointment.history}
                                  </p>
                                </div>
                              </div>
                           </div>
                           <div className="flex sm:flex-col gap-2 shrink-0 pt-2 sm:pt-0">
                              <a 
                                href={createWhatsAppUrl(appointment.phone, appointment)}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-sm bg-[#25D366] hover:bg-[#20bd5a] text-white py-2 px-4 rounded-xl transition-all font-medium shadow-sm"
                              >
                                <MessageCircle className="h-4 w-4" />
                                WhatsApp
                              </a>
                              <a 
                                href={`tel:${appointment.phone}`}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-sm bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 py-2 px-4 rounded-xl transition-all font-medium shadow-sm"
                              >
                                <Phone className="h-4 w-4" />
                                Call Patient
                              </a>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                     <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                       <Calendar className="h-8 w-8 text-slate-300" />
                     </div>
                    <p className="text-slate-500 font-medium">No appointments scheduled for today</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-4 pb-4 px-6 border-t border-slate-100 bg-white/50">
                <Button variant="ghost" className="w-full text-slate-600 hover:text-slate-900 rounded-xl" asChild>
                   <Link to="/doctor/schedule" className="flex items-center justify-center">
                     View Full Schedule <ChevronRight className="h-4 w-4 ml-1" />
                   </Link>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants} className="lg:col-span-1 space-y-6">
            <Card className="glass-card shadow-sm border-white/60 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-healthy-400/10 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
              <CardHeader className="pb-4 border-b border-slate-100">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
                   <div className="p-2 bg-healthy-50 rounded-lg">
                      <Activity className="h-5 w-5 text-healthy-600" />
                   </div>
                   Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid gap-3">
                  <Button className="w-full justify-start bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-12 shadow-md" asChild>
                    <Link to="/doctor/patients/upload-report">
                      <FileText className="h-4 w-4 mr-3" />
                      Upload Patient Report
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start h-12 rounded-xl bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm" asChild>
                    <Link to="/doctor/schedule/manage">
                      <Calendar className="h-4 w-4 mr-3 text-blue-500" />
                      Manage Schedule
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start h-12 rounded-xl bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm" asChild>
                    <Link to="/doctor/patients">
                      <Users className="h-4 w-4 mr-3 text-healthy-500" />
                      Patient Directory
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Pending Reports Summary widget */}
            <Card className="glass-card shadow-sm border-white/60">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
                   <div className="p-2 bg-amber-50 rounded-lg">
                      <FileText className="h-5 w-5 text-amber-500" />
                   </div>
                   Reports to Review
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 p-0">
                 <div className="divide-y divide-slate-100">
                   {pendingReports.slice(0, 3).map(report => (
                     <div key={report.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div>
                           <h4 className="font-semibold text-slate-900 text-sm">{report.patient}</h4>
                           <p className="text-xs text-slate-500">{report.type}</p>
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full text-slate-400 hover:text-amber-600 hover:bg-amber-50" asChild>
                          <Link to={`/doctor/reports/create/${report.id}`}>
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </Button>
                     </div>
                   ))}
                 </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default DoctorDashboard;
