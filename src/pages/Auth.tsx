
import { useState } from 'react';
import { AuthForm } from '@/components/auth/AuthForm';
import { MagicLinkSent } from '@/components/auth/MagicLinkSent';

interface AuthPageProps {
  onLogin: (user: { id: string; email: string; name?: string }) => void;
}

export const AuthPage = ({ onLogin }: AuthPageProps) => {
  const [magicLinkEmail, setMagicLinkEmail] = useState<string | null>(null);

  const handleMagicLinkSent = (email: string) => {
    setMagicLinkEmail(email);
  };

  const handleBack = () => {
    setMagicLinkEmail(null);
  };

  const handleSimulateLogin = () => {
    if (magicLinkEmail) {
      onLogin({
        id: 'demo-user-1',
        email: magicLinkEmail,
        name: magicLinkEmail.split('@')[0]
      });
    }
  };

  if (magicLinkEmail) {
    return (
      <MagicLinkSent 
        email={magicLinkEmail} 
        onBack={handleBack}
        onSimulateLogin={handleSimulateLogin}
      />
    );
  }

  return <AuthForm onMagicLinkSent={handleMagicLinkSent} />;
};
