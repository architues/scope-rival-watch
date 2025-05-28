
import { Home, Users, History, Settings, Zap } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';

const menuItems = [
  {
    title: "Dashboard",
    icon: Home,
    url: "/",
    isActive: true
  },
  {
    title: "Competitors",
    icon: Users,
    url: "/competitors"
  },
  {
    title: "Change History",
    icon: History,
    url: "/history"
  },
  {
    title: "Settings",
    icon: Settings,
    url: "/settings"
  }
];

export const AppSidebar = () => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
    e.currentTarget.style.display = 'none';
    if (fallback) {
      fallback.style.display = 'flex';
    }
  };

  return (
    <Sidebar className="sidebar-blur">
      <SidebarHeader className="p-6 border-b border-white/20">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center">
            <img 
              src="/lovable-uploads/276928ab-c84a-4e27-9662-471d2c134953.png" 
              alt="ScopeRival Logo"
              className="h-10 w-auto"
              onError={handleImageError}
            />
            <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{display: 'none'}}>
              SR
            </div>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">ScopeRival</h1>
            <p className="text-xs text-gray-500">Competitor Intelligence</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-4 py-6">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={item.isActive}
                    className={`
                      w-full justify-start px-4 py-3 rounded-xl transition-all duration-200 font-medium
                      ${item.isActive 
                        ? 'bg-primary text-white shadow-lg shadow-primary/25' 
                        : 'hover:bg-white/60 text-gray-700 hover:text-gray-900'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-6 border-t border-white/20">
        <div className="glass-card p-4 text-center">
          <div className="w-8 h-8 gradient-secondary rounded-full mx-auto mb-3 flex items-center justify-center">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <p className="text-sm font-semibold text-gray-900 mb-1">Pro Plan</p>
          <p className="text-xs text-gray-500">Unlimited tracking</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
