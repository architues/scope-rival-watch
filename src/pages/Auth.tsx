
import { useState } from 'react';
import { AuthForm } from '@/components/auth/AuthForm';
import { MagicLinkSent } from '@/components/auth/MagicLinkSent';
import { useAuth } from '@/hooks/useAuth';

export const AuthPage = () => {
  const [magicLinkEmail, setMagicLinkEmail] = useState<string | null>(null);
  const { signIn } = useAuth();

  const handleMagicLinkSent = async (email: string) => {
    const result = await signIn(email);
    if (result.error) {
      // Handle error - could show toast or set error state
      console.error('Sign in error:', result.error);
      return;
    }
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
