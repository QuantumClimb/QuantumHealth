
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, FileText, ArrowRight, MessageSquare, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SEO from '@/components/SEO';

const Index = () => {
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  const features = [
    { 
      id: 'appointments', 
      icon: <Calendar className="h-6 w-6" />, 
      title: 'Smart Scheduling',
      description: 'Book and manage appointments with our specialists online with intelligent scheduling',
      color: 'from-healthy-400 to-nature-400'
    },
    { 
      id: 'reports', 
      icon: <FileText className="h-6 w-6" />, 
      title: 'Digital Health Records',
      description: 'Access your medical reports and lab results anytime, anywhere securely',
      color: 'from-amber-400 to-orange-400'
    },
    { 
      id: 'chat', 
      icon: <MessageSquare className="h-6 w-6" />, 
      title: 'Secure Communication',
      description: 'Chat with your doctor or our clinic via WhatsApp with end-to-end encryption',
      color: 'from-green-400 to-emerald-500'
    },
  ];

  const specialties = [
    { name: 'Dentistry', icon: '🦷', color: 'border-healthy-400' },
    { name: 'Orthopaedics', icon: '🦴', color: 'border-nature-500' },
    { name: 'Cancer Screening', icon: '🔬', color: 'border-amber-400' },
    { name: 'Lab Work', icon: '🧪', color: 'border-purple-400' },
  ];

  return (
    <>
      <SEO 
        title="QUANTUM HEALTH - Advanced Healthcare Management Platform"
        description="Revolutionary healthcare management platform connecting patients and doctors. Secure messaging, digital records, appointment booking, and comprehensive health tracking."
        keywords="healthcare management, patient portal, doctor portal, medical appointments, health records, telemedicine, healthcare platform, medical reports, patient communication, healthcare technology"
        url="https://quantumhealth.quantum-climb.com/"
        tags={['healthcare', 'telemedicine', 'patient portal', 'doctor portal', 'medical appointments']}
      />
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-healthy-50 to-nature-50 opacity-70"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-healthy-600 to-nature-600 text-transparent bg-clip-text mb-6">
            QUANTUM HEALTH
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl">
            Revolutionary healthcare management platform connecting patients and doctors for a healthier tomorrow
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              asChild
              className="bg-gradient-to-r from-healthy-400 to-nature-400 hover:from-healthy-500 hover:to-nature-500 text-white px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all text-lg font-medium"
            >
              <Link to="/login">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button 
              variant="outline"
              asChild
              className="border-2 border-healthy-300 text-healthy-700 px-8 py-6 rounded-full hover:bg-healthy-50 transition-all text-lg font-medium"
            >
              <Link to="/login">
                Doctor Login
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Making Healthcare <span className="text-healthy-500">Simple</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              QUANTUM HEALTH offers a comprehensive range of medical services and digital tools to meet your healthcare needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.id}
                className="relative group"
                onMouseEnter={() => setHoveredFeature(feature.id)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  <Link 
                    to="/login" 
                    className="text-sm text-healthy-600 hover:text-healthy-700 font-medium inline-flex items-center mt-4 group-hover:translate-x-1 transition-transform"
                  >
                    Learn more
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specialties Section */}
      <section className="py-20 bg-gradient-to-r from-healthy-50 to-nature-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Medical Specialties</h2>
            <div className="bg-gradient-to-r from-healthy-400 to-nature-400 h-2 w-24 mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Join thousands of patients who trust QUANTUM HEALTH for their healthcare needs across multiple specialties.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {specialties.map((specialty) => (
              <div key={specialty.name} className="bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-healthy-200">
                <div className="text-4xl mb-4">{specialty.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{specialty.name}</h3>
                <p className="text-gray-600 text-sm mb-4">Expert care and treatment</p>
                <Button 
                  asChild
                  className="bg-gradient-to-r from-healthy-400 to-nature-400 hover:from-healthy-500 hover:to-nature-500 text-white px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all text-sm font-medium"
                >
                  <Link to="/login">
                    Book Appointment
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Experience Modern Healthcare?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join QUANTUM HEALTH today and take control of your healthcare journey with our advanced digital platform.
          </p>
          <Button 
            asChild
            className="bg-gradient-to-r from-healthy-400 to-nature-400 hover:from-healthy-500 hover:to-nature-500 text-white px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all text-lg font-medium"
          >
            <Link to="/login">
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="bg-white border-t border-gray-100 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-healthy-400 to-nature-500 text-transparent bg-clip-text">
                QUANTUM HEALTH
              </h2>
              <p className="text-gray-500 mt-1">Revolutionary healthcare management platform</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 items-center">
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="h-4 w-4 text-healthy-500" />
                <span>(123) 456-7890</span>
              </div>
              <Button 
                variant="outline" 
                className="border-healthy-200 text-healthy-600 hover:bg-healthy-50"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Chat with us
              </Button>
            </div>
          </div>
          
          <div className="border-t border-gray-100 mt-8 pt-8 text-center text-gray-500 text-sm">
            © 2025 QUANTUM HEALTH. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
    </>
  );
};

export default Index;
