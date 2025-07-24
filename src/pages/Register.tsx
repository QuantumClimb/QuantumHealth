/**
 * Registration Page
 * Uses the RegistrationSelector component for user registration
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import RegistrationSelector from '@/components/auth/RegistrationSelector';
import SEO from '@/components/SEO';

const Register = () => {
  const navigate = useNavigate();

  const handleSuccess = (user: unknown) => {
    // User successfully registered, they'll be redirected by the component
    console.log('Registration successful:', user);
  };

  const handleCancel = () => {
    navigate('/login');
  };

  return (
    <>
      <SEO 
        title="Register - QUANTUM HEALTH"
        description="Join QUANTUM HEALTH as a patient or healthcare provider. Create your secure account and start managing your healthcare journey."
        keywords="register, sign up, patient registration, doctor registration, healthcare account, medical portal signup"
        url="https://quantumhealth.quantum-climb.com/register"
        tags={['registration', 'signup', 'patient portal', 'doctor portal', 'healthcare']}
      />
      
      <RegistrationSelector 
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </>
  );
};

export default Register; 