
import { User } from '@/types/competitor';
import { Button } from '@/components/ui/button';
import { LogOut, Bell } from 'lucide-react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
}

export const Layout = ({ children, user, onLogout }: LayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        <AppSidebar />
        
        <SidebarInset className="flex-1">
          {/* Top Header */}
          <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-white/20">
            <div className="flex h-16 items-center justify-between px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="lg:hidden" />
                <h2 className="text-xl font-semibold text-gray-900">Dashboard</h2>
              </div>
              
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" className="relative rounded-xl">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full"></span>
                </Button>
                
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.name?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">{user.name || 'User'}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onLogout}
                    className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 rounded-xl"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </header>
          
          {/* Main Content */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
