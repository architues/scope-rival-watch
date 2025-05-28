
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface AuthFormProps {
  onMagicLinkSent: (email: string) => void;
}

export const AuthForm = ({ onMagicLinkSent }: AuthFormProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    
    try {
      const result = await signIn(email);
      if (!result.error) {
        onMagicLinkSent(email);
      }
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo and Welcome */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-6">
            <img 
              src="/lovable-uploads/3f60d4c0-19b0-4059-b970-719a9bdafe92.png" 
              alt="ScopeRival Logo"
              className="h-20 w-auto"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to ScopeRival</h1>
          <p className="text-gray-600">Track your competitors and stay ahead of the game</p>
        </div>

        {/* Auth Card */}
        <Card className="glass-card border-0">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Input
                  id="email"
                  type="email"
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 text-base border-gray-200 focus:border-primary focus:ring-primary"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 gradient-primary text-white font-semibold text-base rounded-xl hover:shadow-lg transition-all duration-200" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending magic link...
                  </div>
                ) : (
                  "Send Magic Link ✨"
                )}
              </Button>
            </form>
            
            <p className="text-xs text-gray-500 text-center mt-6">
              By continuing, you agree to ScopeRival's Terms & Conditions and Privacy Policy
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
