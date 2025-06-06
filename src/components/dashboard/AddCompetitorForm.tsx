import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Globe } from 'lucide-react';
import { Competitor } from '@/types/competitor';
import { toast } from '@/hooks/use-toast';

const DEBUG = process.env.NODE_ENV === 'development';

interface AddCompetitorFormProps {
  onAddCompetitor: (competitor: Omit<Competitor, 'id' | 'addedAt'>) => void;
}

/**
 * Form component for adding new competitors to track.
 * Handles form validation, URL formatting, and submission.
 * Provides visual feedback for validation errors and loading states.
 */
export const AddCompetitorForm = ({ onAddCompetitor }: AddCompetitorFormProps) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; url?: string }>({});

  /**
   * Validates the form inputs:
   * - Checks for required fields
   * - Validates URL format
   * - Sets error messages for invalid fields
   * @returns boolean indicating if the form is valid
   */
  const validateForm = () => {
    const newErrors: { name?: string; url?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = 'Competitor name is required';
    }
    
    if (!url.trim()) {
      newErrors.url = 'Website URL is required';
    } else {
      try {
        const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
        new URL(formattedUrl);
      } catch {
        newErrors.url = 'Please enter a valid URL';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles form submission:
   * 1. Validates form inputs
   * 2. Formats URL if needed
   * 3. Creates competitor object
   * 4. Calls onAddCompetitor callback
   * 5. Resets form on success
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      if (DEBUG) console.log('AddCompetitorForm: Form validation failed - missing name or url');
      toast({
        title: "Validation error",
        description: "Please check the form for errors.",
        variant: "destructive",
      });
      return;
    }

    if (DEBUG) console.log('AddCompetitorForm: Submitting competitor', { name, url });
    setIsLoading(true);
    
    try {
      // Format URL properly
      const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
      
      const competitor: Omit<Competitor, 'id' | 'addedAt'> = {
        name: name.trim(),
        url: formattedUrl,
        status: 'active',
        lastChecked: new Date(),
        changesDetected: 0
      };

      if (DEBUG) console.log('AddCompetitorForm: Calling onAddCompetitor with:', competitor);
      onAddCompetitor(competitor);
      
      // Reset form
      setName('');
      setUrl('');
      setErrors({});
      if (DEBUG) console.log('AddCompetitorForm: Form reset after submission');
    } catch (error) {
      if (DEBUG) console.error('AddCompetitorForm: Error during submission:', error);
      toast({
        title: "Error adding competitor",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-sky-50 rounded-lg">
          <Plus className="h-5 w-5 text-sky-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Add New Competitor</h2>
          <p className="text-sm text-gray-600">Start tracking a new competitor website</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Competitor Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="e.g., Acme Corp"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full ${errors.name ? 'border-red-500' : ''}`}
              required
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="url" className="text-sm font-medium text-gray-700">
              Website URL
            </Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="url"
                type="url"
                placeholder="competitor.com"
                className={`pl-10 w-full ${errors.url ? 'border-red-500' : ''}`}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>
            {errors.url && (
              <p className="text-sm text-red-500">{errors.url}</p>
            )}
          </div>
        </div>
        
        <Button 
          type="submit" 
          disabled={isLoading || !name.trim() || !url.trim()}
          style={{ backgroundColor: '#38BDF8' }}
          className="hover:bg-sky-600 text-white px-6 py-2"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Adding...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Competitor
            </div>
          )}
        </Button>
      </form>
    </div>
  );
};
