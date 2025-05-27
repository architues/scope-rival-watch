
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, ArrowLeft } from 'lucide-react';

interface MagicLinkSentProps {
  email: string;
  onBack: () => void;
  onSimulateLogin: () => void;
}

export const MagicLinkSent = ({ email, onBack }: MagicLinkSentProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-green-600 p-3 rounded-lg">
              <Mail className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Check your email</CardTitle>
          <CardDescription className="text-gray-600">
            We've sent a magic link to <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Click the link in your email to sign in instantly. The link will expire in 15 minutes.
            </p>
          </div>
          
          <Button 
            variant="outline" 
            onClick={onBack}
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to login
          </Button>
          
          <p className="text-xs text-gray-500 text-center">
            Didn't receive the email? Check your spam folder or try again.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
