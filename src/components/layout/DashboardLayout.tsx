import { ReactNode } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogOut, BookOpen, User, Settings, LayoutDashboard, Users, BookMarked, BarChart3, Baby } from "lucide-react";
import { useAuth } from "../../lib/AuthContext";
import { logoutUser } from "../../lib/firebase";
import { Button } from "../ui/button";

interface LayoutProps {
  children: ReactNode;
  navItems: { label: string; path: string; icon: ReactNode }[];
  title: string;
}

export function DashboardLayout({ children, navItems, title }: LayoutProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200 flex items-center gap-2">
          <BookOpen className="w-8 h-8 text-primary" />
          <span className="font-bold text-xl text-slate-800">Aspic Books</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600">
            <User className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 truncate">{user?.displayName || "User"}</p>
              <p className="text-xs text-slate-500 truncate">{user?.role === "admin" ? "Super Admin" : "Parent"}</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 mt-2" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-800">{title}</h1>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

export function AdminLayout({ children, title }: { children: ReactNode; title: string }) {
  return (
    <DashboardLayout
      title={title}
      navItems={[
        { label: "Dashboard", path: "/admin", icon: <LayoutDashboard className="w-5 h-5" /> },
        { label: "Users & Families", path: "/admin/users", icon: <Users className="w-5 h-5" /> },
        { label: "Story Library", path: "/admin/stories", icon: <BookMarked className="w-5 h-5" /> },
        { label: "Platform Analytics", path: "/admin/analytics", icon: <BarChart3 className="w-5 h-5" /> },
        { label: "Settings", path: "/admin/settings", icon: <Settings className="w-5 h-5" /> },
      ]}
    >
      {children}
    </DashboardLayout>
  );
}

export function ParentLayout({ children, title }: { children: ReactNode; title: string }) {
  return (
    <DashboardLayout
      title={title}
      navItems={[
        { label: "My Family", path: "/parent", icon: <Baby className="w-5 h-5" /> },
        { label: "Story Library", path: "/parent/stories", icon: <BookMarked className="w-5 h-5" /> },
        { label: "Reading Stats", path: "/parent/stats", icon: <BarChart3 className="w-5 h-5" /> },
        { label: "Settings", path: "/parent/settings", icon: <Settings className="w-5 h-5" /> },
      ]}
    >
      {children}
    </DashboardLayout>
  );
}
