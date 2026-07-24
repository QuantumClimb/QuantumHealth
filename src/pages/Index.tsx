import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, FileText, ArrowRight, MessageSquare, Phone, Activity, ShieldCheck, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import SEO from '@/components/SEO';

const Index = () => {
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  const features = [
    { 
      id: 'appointments', 
      icon: <Calendar className="h-6 w-6" />, 
      title: 'Smart Scheduling',
      description: 'Intelligent scheduling algorithms to reduce wait times and optimize clinic workflows instantly.',
      color: 'from-blue-500 to-cyan-400',
      colSpan: 'md:col-span-2'
    },
    { 
      id: 'reports', 
      icon: <FileText className="h-6 w-6" />, 
      title: 'Digital Records',
      description: 'End-to-end encrypted medical records accessible 24/7.',
      color: 'from-purple-500 to-pink-400',
      colSpan: 'md:col-span-1'
    },
    { 
      id: 'chat', 
      icon: <MessageSquare className="h-6 w-6" />, 
      title: 'Secure Comms',
      description: 'HIPAA-compliant messaging with patients.',
      color: 'from-emerald-400 to-teal-500',
      colSpan: 'md:col-span-1'
    },
    { 
      id: 'analytics', 
      icon: <Activity className="h-6 w-6" />, 
      title: 'Health Analytics',
      description: 'Advanced reporting and insights for better clinical decisions and patient outcomes.',
      color: 'from-orange-400 to-red-400',
      colSpan: 'md:col-span-2'
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <>
      <SEO 
        title="QUANTUM HEALTH - Healthcare OS"
        description="The modern operating system for health clinics. Secure messaging, digital records, and intelligent appointment booking."
      />
      <div className="min-h-screen bg-slate-50 overflow-hidden font-sans selection:bg-healthy-500/20 selection:text-healthy-700">
        
        {/* Animated Background Blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-healthy-300/30 blur-[100px] mix-blend-multiply animate-blob"></div>
          <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] rounded-full bg-blue-300/30 blur-[100px] mix-blend-multiply animate-blob" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-purple-300/30 blur-[100px] mix-blend-multiply animate-blob" style={{ animationDelay: '4s' }}></div>
        </div>

        {/* Navigation */}
        <nav className="fixed w-full z-50 glass-card rounded-none border-t-0 border-x-0 border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-20 items-center">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-healthy-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                  QuantumHealth
                </span>
              </div>
              <div className="flex gap-4">
                <Button variant="ghost" className="hidden sm:flex text-slate-600 hover:text-slate-900 hover:bg-slate-100" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-6 shadow-md transition-all hover:shadow-lg" asChild>
                  <Link to="/login">Get Started</Link>
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative pt-40 pb-20 lg:pt-48 lg:pb-32 px-4 max-w-7xl mx-auto flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-slate-200/60 backdrop-blur-md shadow-sm mb-8"
          >
            <span className="flex h-2 w-2 rounded-full bg-healthy-500 animate-pulse"></span>
            <span className="text-sm font-medium text-slate-700">Quantum Health OS 2.0 is now live</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 max-w-4xl"
          >
            The Modern Operating System for <span className="text-transparent bg-clip-text bg-gradient-to-r from-healthy-500 to-blue-600">Health Clinics</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-2xl text-slate-600 max-w-3xl mb-10 leading-relaxed"
          >
            Unify your patient records, appointments, and secure communications in one elegant platform designed for modern healthcare teams.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-8 h-14 text-lg shadow-[0_0_20px_rgba(15,23,42,0.15)] transition-all hover:scale-105" asChild>
              <Link to="/login">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-lg border-slate-200 bg-white/50 backdrop-blur-sm hover:bg-slate-100 transition-all text-slate-700" asChild>
              <Link to="/login">
                Doctor Login
              </Link>
            </Button>
          </motion.div>

          {/* Abstract Dashboard Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="w-full max-w-5xl mt-20 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-slate-50 to-transparent z-10 top-1/2"></div>
            <div className="glass-card p-2 sm:p-4 rounded-3xl border border-white/60 shadow-2xl relative overflow-hidden bg-white/40">
              <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 shadow-inner">
                {/* Mockup Header */}
                <div className="h-12 border-b border-slate-200 bg-white flex items-center px-4 gap-4">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="bg-slate-100 h-6 w-64 rounded-md mx-auto hidden sm:block"></div>
                </div>
                {/* Mockup Body */}
                <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6 h-[400px]">
                  <div className="sm:col-span-2 space-y-4">
                    <div className="h-32 bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-healthy-100"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-slate-100 rounded w-1/3"></div>
                        <div className="h-3 bg-slate-50 rounded w-1/4"></div>
                        <div className="h-8 bg-slate-50 rounded w-full mt-2"></div>
                      </div>
                    </div>
                    <div className="h-48 bg-white rounded-xl border border-slate-100 shadow-sm flex items-end p-4 gap-2">
                       {/* Mock Chart */}
                       {[40, 70, 45, 90, 65, 80, 50, 95].map((h, i) => (
                         <div key={i} className="flex-1 bg-gradient-to-t from-blue-100 to-healthy-200 rounded-t-sm" style={{ height: `${h}%` }}></div>
                       ))}
                    </div>
                  </div>
                  <div className="space-y-4 hidden sm:block">
                    <div className="h-24 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl shadow-sm p-4"></div>
                    <div className="h-56 bg-white rounded-xl border border-slate-100 shadow-sm p-4 space-y-3">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="flex gap-3 items-center">
                           <div className="w-8 h-8 rounded-full bg-slate-100"></div>
                           <div className="flex-1 h-3 bg-slate-50 rounded"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Trusted By Strip */}
        <section className="py-10 border-y border-slate-200/60 bg-white/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4">
            <p className="text-center text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">
              Trusted by innovative clinics worldwide
            </p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale">
              {['Acme Health', 'Pulse Medical', 'Nexus Care', 'Apex Clinical'].map((name, i) => (
                <div key={i} className="flex items-center gap-2 text-xl font-bold text-slate-700">
                  <ShieldCheck className="h-6 w-6" />
                  {name}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bento Grid Features */}
        <section className="py-32 px-4 max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">
              Everything you need. <br className="hidden sm:block" />
              <span className="text-slate-500">Nothing you don't.</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              A comprehensive suite of tools perfectly integrated to give your staff superpowers and your patients peace of mind.
            </p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.id}
                variants={itemVariants}
                className={`bento-card group relative overflow-hidden ${feature.colSpan}`}
                onMouseEnter={() => setHoveredFeature(feature.id)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${feature.color} opacity-10 rounded-bl-full transition-transform duration-500 group-hover:scale-150`}></div>
                
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-6 shadow-sm`}>
                  {feature.icon}
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 text-lg leading-relaxed mb-6">{feature.description}</p>
                
                <Link 
                  to="/login" 
                  className="inline-flex items-center font-medium text-slate-900 group-hover:text-healthy-600 transition-colors"
                >
                  Explore feature
                  <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Specialties (Modernized) */}
        <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
          
          <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-16">Built for every specialty</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {[
                { name: 'Dentistry', icon: Stethoscope },
                { name: 'Orthopaedics', icon: Activity },
                { name: 'Cardiology', icon: ShieldCheck },
                { name: 'Pediatrics', icon: Calendar },
              ].map((spec, i) => (
                <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors backdrop-blur-sm cursor-pointer group">
                  <spec.icon className="h-8 w-8 text-healthy-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-semibold">{spec.name}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <footer className="bg-white py-20 px-4 border-t border-slate-200">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-6 w-6 text-healthy-600" />
                <span className="text-2xl font-bold text-slate-900">QuantumHealth</span>
              </div>
              <p className="text-slate-500">Transforming clinical operations worldwide.</p>
            </div>
            
            <div className="flex gap-4">
              <Button size="lg" className="bg-slate-900 hover:bg-slate-800 rounded-full px-8" asChild>
                <Link to="/login">Get Started</Link>
              </Button>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
};

export default Index;
