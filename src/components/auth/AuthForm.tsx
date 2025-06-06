import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface AuthFormProps {
  onMagicLinkSent: (email: string) => void;
}

const DEBUG = process.env.NODE_ENV === 'development';

export const AuthForm = ({ onMagicLinkSent }: AuthFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const { signIn, signUp, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || (!password && !isForgotPassword)) return;

    setIsLoading(true);
    
    try {
      if (isForgotPassword) {
        const result = await resetPassword(email);
        if (!result.error) {
          setIsForgotPassword(false);
          onMagicLinkSent(email); // Show success message
        }
        return;
      }

      let result;
      if (isLogin) {
        result = await signIn(email, password);
      } else {
        result = await signUp(email, password);
        // For sign up success, show the confirmation message
        if (!result.error) {
          onMagicLinkSent(email);
        }
      }
      
      if (DEBUG) console.log(`${isLogin ? 'Sign in' : 'Sign up'} successful`);
    } catch (error) {
      if (DEBUG) console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setIsForgotPassword(false);
    setEmail('');
    setPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo and Welcome */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-6">
            <img 
              src="/lovable-uploads/ace15847-865a-418d-b021-effaf5f07ca8.png" 
              alt="ScopeRival Logo"
              className="h-20 w-auto"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isForgotPassword 
              ? 'Reset your password' 
              : isLogin 
                ? 'Welcome back' 
                : 'Join ScopeRival'
            }
          </h1>
          <p className="text-gray-600">
            {isForgotPassword 
              ? 'Enter your email to receive a password reset link'
              : isLogin 
                ? 'Sign in to track your competitors' 
                : 'Create an account to get started'
            }
          </p>
        </div>

        {/* Auth Card */}
        <Card className="glass-card border-0">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 pl-12 text-base border-gray-200 focus:border-primary focus:ring-primary"
                  />
                </div>
                
                {!isForgotPassword && (
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 pl-12 pr-12 text-base border-gray-200 focus:border-primary focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                )}
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 gradient-primary text-white font-semibold text-base rounded-xl hover:shadow-lg transition-all duration-200" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {isForgotPassword 
                      ? 'Sending reset link...' 
                      : isLogin 
                        ? 'Signing in...' 
                        : 'Creating account...'
                    }
                  </div>
                ) : (
                  isForgotPassword 
                    ? 'Send Reset Link' 
                    : isLogin 
                      ? 'Sign In' 
                      : 'Create Account'
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center space-y-3">
              {!isForgotPassword ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-primary hover:text-primary/80 font-medium transition-colors block w-full"
                  >
                    {isLogin 
                      ? "Don't have an account? Sign up" 
                      : "Already have an account? Sign in"
                    }
                  </button>
                  
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
                    >
                      Forgot your password?
                    </button>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Back to sign in
                </button>
              )}
            </div>
            
            <p className="text-xs text-gray-500 text-center mt-6">
              By continuing, you agree to ScopeRival's Terms & Conditions and Privacy Policy
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
