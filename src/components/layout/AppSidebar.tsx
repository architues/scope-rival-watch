
import { Home, Users, History, Settings, Zap } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
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
  return (
    <Sidebar className="border-r border-border/40">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="gradient-primary p-2.5 rounded-xl">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-jakarta">ScopeRival</h1>
            <p className="text-xs text-muted-foreground">Competitor Intelligence</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-3 mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={item.isActive}
                    className={`
                      w-full justify-start px-3 py-2.5 rounded-xl transition-all duration-200
                      ${item.isActive 
                        ? 'bg-primary text-primary-foreground shadow-lg' 
                        : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.title}</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-6">
        <div className="glass-card">
          <div className="text-center">
            <div className="w-8 h-8 gradient-secondary rounded-full mx-auto mb-2 flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <p className="text-sm font-medium">Pro Plan</p>
            <p className="text-xs text-muted-foreground">Unlimited tracking</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
