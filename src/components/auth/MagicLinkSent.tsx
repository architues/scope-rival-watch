
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

interface MagicLinkSentProps {
  email: string;
  onBack: () => void;
  onSimulateLogin: () => void;
}

export const MagicLinkSent = ({ email, onBack }: MagicLinkSentProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-md">
        <Card className="glass-card border-0">
          <CardHeader className="text-center pt-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">Check your email</CardTitle>
            <CardDescription className="text-gray-600">
              We've sent a magic link to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-800">
                Click the link in your email to sign in instantly. The link will expire in 15 minutes.
              </p>
            </div>
            
            <Button 
              variant="outline" 
              onClick={onBack}
              className="w-full h-12 rounded-xl border-gray-200 hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to login
            </Button>
            
            <p className="text-xs text-gray-500 text-center mt-6">
              Didn't receive the email? Check your spam folder or try again.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
