/**
 * Password Reset Page
 * Uses the PasswordReset component for password reset functionality
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import PasswordReset from '@/components/auth/PasswordReset';
import SEO from '@/components/SEO';

const PasswordResetPage = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Password reset successful, redirect to login
    navigate('/login');
  };

  const handleCancel = () => {
    navigate('/login');
  };

  return (
    <>
      <SEO 
        title="Password Reset - QUANTUM HEALTH"
        description="Reset your QUANTUM HEALTH password securely. Enter your email to receive reset instructions."
        keywords="password reset, forgot password, reset password, healthcare login recovery"
        url="https://quantumhealth.quantum-climb.com/password-reset"
        tags={['password reset', 'forgot password', 'authentication', 'security']}
      />
      
      <PasswordReset 
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </>
  );
};

export default PasswordResetPage; 