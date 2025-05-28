
import { Home, Users, History, Settings } from 'lucide-react';
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
    <Sidebar className="w-64 bg-white border-r border-gray-200">
      <SidebarHeader className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center">
            <img 
              src="/lovable-uploads/ace15847-865a-418d-b021-effaf5f07ca8.png" 
              alt="ScopeRival Logo"
              className="h-8 w-auto"
              onError={handleImageError}
            />
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{display: 'none'}}>
              SR
            </div>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">ScopeRival</h1>
            <p className="text-xs text-gray-500">Competitor Intelligence</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-4 py-6">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={item.isActive}
                    className={`
                      w-full justify-start px-3 py-2 rounded-lg transition-colors duration-200 font-medium
                      ${item.isActive 
                        ? 'bg-purple-50 text-purple-600 border border-purple-200' 
                        : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
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
      
      <SidebarFooter className="p-6 border-t border-gray-200">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="w-8 h-8 bg-purple-600 rounded-full mx-auto mb-3 flex items-center justify-center">
            <span className="text-white text-xs font-semibold">PRO</span>
          </div>
          <p className="text-sm font-medium text-gray-900 mb-1">Pro Plan</p>
          <p className="text-xs text-gray-500">Unlimited tracking</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
