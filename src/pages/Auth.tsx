import { useState } from 'react';
import { AuthForm } from '@/components/auth/AuthForm';
import { MagicLinkSent } from '@/components/auth/MagicLinkSent';

const DEBUG = process.env.NODE_ENV === 'development';

export const AuthPage = () => {
  const [magicLinkEmail, setMagicLinkEmail] = useState<string | null>(null);

  const handleMagicLinkSent = (email: string) => {
    if (DEBUG) console.log('Magic link sent to:', email);
    setMagicLinkEmail(email);
  };

  const handleBack = () => {
    setMagicLinkEmail(null);
  };

  if (magicLinkEmail) {
    return (
      <MagicLinkSent 
        email={magicLinkEmail} 
        onBack={handleBack}
        onSimulateLogin={() => {}} // Removed demo functionality for production
      />
    );
  }

  return <AuthForm onMagicLinkSent={handleMagicLinkSent} />;
};
