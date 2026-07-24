import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, FileText, MessageSquare, ChevronRight, MessageCircle, Clock, ShieldCheck, Activity } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { multiTenantService, type Appointment, type MedicalReport, type DoctorProfile, type PatientProfile } from '@/services/supabaseService';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const createWhatsAppUrl = (phone: string, appointmentInfo: any) => {
  const message = encodeURIComponent(
    `Hello, this is regarding my appointment with ${appointmentInfo.doctor} on ${appointmentInfo.date} at ${appointmentInfo.time} for ${appointmentInfo.specialty}. I would like to confirm this appointment. Thank you!`
  );
  return `https://wa.me/${phone}?text=${message}`;
};

const PatientDashboard = () => {
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [recentReports, setRecentReports] = useState<MedicalReport[]>([]);
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [appointmentsData, reportsData, doctorsData, patientsData] = await Promise.all([
        multiTenantService.getAppointments(),
        multiTenantService.getMedicalReports(),
        multiTenantService.getDoctors(),
        multiTenantService.getPatients()
      ]);

      const upcoming = appointmentsData.filter(apt => {
        const appointmentDate = new Date(apt.appointment_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return apt.status === 'scheduled' && appointmentDate >= today;
      }).sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime());

      const recent = reportsData
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

      setUpcomingAppointments(upcoming);
      setRecentReports(recent);
      setDoctors(doctorsData);
      setPatients(patientsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const getDoctorName = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? `Dr. ${doctor.first_name} ${doctor.last_name}` : 'Unknown Doctor';
  };

  const formatAppointmentDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatReportDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const nextAppointment = upcomingAppointments[0];
  const clinicWhatsApp = '+14155552671';

  if (loading) {
    return (
      <Layout userRole="patient">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-healthy-500 animate-spin mb-4"></div>
            <h2 className="text-xl font-semibold text-slate-800">Syncing your workspace...</h2>
          </div>
        </div>
      </Layout>
    );
  }

  const currentPatient = patients[0];
  const patientName = currentPatient ? currentPatient.first_name : 'Patient';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Layout userRole="patient">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full">
        <motion.header variants={itemVariants} className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back, {patientName}</h1>
            <p className="text-slate-500 mt-1">Here is what's happening with your health today.</p>
          </div>
          <Button className="bg-healthy-600 hover:bg-healthy-700 text-white rounded-full px-6 shadow-md" asChild>
            <Link to="/patient/appointments/book">
              <Calendar className="mr-2 h-4 w-4" />
              Book Appointment
            </Link>
          </Button>
        </motion.header>

        <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {/* Upcoming Appointment */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <Card className="glass-card shadow-sm border-white/60 h-full flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-healthy-400/10 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
                  <div className="p-2 bg-healthy-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-healthy-600" />
                  </div>
                  Next Appointment
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 pt-4">
                {nextAppointment ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-slate-900">{getDoctorName(nextAppointment.doctor_id)}</h3>
                        <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                           <Activity className="h-3 w-3" /> {nextAppointment.appointment_type || 'Consultation'}
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 font-medium">
                        {nextAppointment.status}
                      </Badge>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Date</span>
                        <span className="font-semibold text-slate-800">{formatAppointmentDate(nextAppointment.appointment_date)}</span>
                      </div>
                      <div className="h-8 w-px bg-slate-200"></div>
                      <div className="flex flex-col text-right">
                        <span className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Time</span>
                        <span className="font-semibold text-slate-800 flex items-center justify-end gap-1">
                           <Clock className="h-3 w-3" /> {nextAppointment.appointment_time}
                        </span>
                      </div>
                    </div>
                    
                    {nextAppointment.notes && (
                      <p className="text-sm text-slate-600 bg-white border border-slate-100 p-3 rounded-lg shadow-sm">
                         <span className="font-medium text-slate-700">Note:</span> {nextAppointment.notes}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                       <Calendar className="h-6 w-6 text-slate-300" />
                    </div>
                    <p className="text-slate-500 mb-4 font-medium">No upcoming appointments</p>
                    <Button variant="outline" size="sm" className="rounded-full" asChild>
                      <Link to="/patient/appointments/book">Schedule Now</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
              {nextAppointment && (
                <CardFooter className="pt-2 pb-4 px-6 border-t border-slate-100">
                  <a 
                    href={createWhatsAppUrl(clinicWhatsApp, {
                      doctor: getDoctorName(nextAppointment.doctor_id),
                      date: formatAppointmentDate(nextAppointment.appointment_date),
                      time: nextAppointment.appointment_time,
                      specialty: nextAppointment.appointment_type
                    })}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white py-2.5 px-4 rounded-xl transition-all shadow-sm font-medium"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Confirm via WhatsApp
                  </a>
                </CardFooter>
              )}
            </Card>
          </motion.div>

          {/* Recent Reports */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <Card className="glass-card shadow-sm border-white/60 h-full flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <FileText className="h-5 w-5 text-amber-500" />
                  </div>
                  Recent Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 pt-4">
                {recentReports.length > 0 ? (
                  <div className="space-y-3">
                    {recentReports.map(report => (
                      <div key={report.id} className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all group/item cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-50 rounded-lg group-hover/item:bg-amber-50 transition-colors">
                            <FileText className="h-4 w-4 text-slate-400 group-hover/item:text-amber-500" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-slate-900">{report.report_name}</h4>
                            <p className="text-xs text-slate-500">{formatReportDate(report.created_at)}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs bg-slate-50">
                          {report.report_type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                     <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                       <FileText className="h-6 w-6 text-slate-300" />
                    </div>
                    <p className="text-slate-500 mb-4 font-medium">No reports available</p>
                    <Button variant="outline" size="sm" className="rounded-full" asChild>
                      <Link to="/patient/reports/upload">Upload Document</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-2 pb-4 px-6 border-t border-slate-100">
                <Button variant="ghost" className="w-full text-slate-600 hover:text-slate-900 rounded-xl" asChild>
                   <Link to="/patient/reports" className="flex items-center justify-center">
                     View All Records <ChevronRight className="h-4 w-4 ml-1" />
                   </Link>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <Card className="glass-card shadow-sm border-white/60 h-full flex flex-col relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Activity className="h-5 w-5 text-blue-500" />
                  </div>
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 pt-4">
                <div className="grid gap-3">
                  <Button variant="outline" className="justify-start h-12 rounded-xl bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm" asChild>
                    <Link to="/patient/appointments/book">
                      <Calendar className="h-4 w-4 mr-3 text-healthy-500" />
                      Book new appointment
                    </Link>
                  </Button>
                  <Button variant="outline" className="justify-start h-12 rounded-xl bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm" asChild>
                    <a href={`https://wa.me/${clinicWhatsApp}`} target="_blank" rel="noopener noreferrer">
                      <MessageSquare className="h-4 w-4 mr-3 text-blue-500" />
                      Message support desk
                    </a>
                  </Button>
                  <Button variant="outline" className="justify-start h-12 rounded-xl bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm" asChild>
                    <Link to="/patient/reports/upload">
                      <FileText className="h-4 w-4 mr-3 text-amber-500" />
                      Upload medical document
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Specialties / Services Section */}
        <motion.section variants={itemVariants} className="mt-12">
          <div className="flex items-center justify-between mb-6">
             <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Browse Services</h2>
             <Button variant="link" className="text-healthy-600 p-0">View all <ChevronRight className="h-4 w-4 ml-1" /></Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              { id: 'dentistry', name: 'Dentistry', icon: ShieldCheck, color: 'text-blue-500', bg: 'bg-blue-50', hover: 'hover:border-blue-200' },
              { id: 'orthopaedics', name: 'Orthopaedics', icon: Activity, color: 'text-healthy-500', bg: 'bg-healthy-50', hover: 'hover:border-healthy-200' },
              { id: 'cancer-screening', name: 'Oncology', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', hover: 'hover:border-amber-200' },
              { id: 'lab-work', name: 'Lab Tests', icon: FileText, color: 'text-purple-500', bg: 'bg-purple-50', hover: 'hover:border-purple-200' },
            ].map((spec) => (
              <Link 
                key={spec.id}
                to={`/patient/appointments/book?specialty=${spec.id}`}
                className={`bg-white border border-slate-100 p-6 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 group ${spec.hover} flex flex-col items-center text-center`}
              >
                <div className={`w-14 h-14 rounded-xl ${spec.bg} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                  <spec.icon className={`h-7 w-7 ${spec.color}`} />
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">{spec.name}</h3>
                <span className="text-xs font-medium text-slate-400 group-hover:text-slate-600 transition-colors">Book Now</span>
              </Link>
            ))}
          </div>
        </motion.section>
      </motion.div>
    </Layout>
  );
};

export default PatientDashboard;
