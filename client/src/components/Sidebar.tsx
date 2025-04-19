import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle } from "lucide-react";
import { 
  LineChart, 
  CalendarDays, 
  BarChart4 
} from "lucide-react";

interface SidebarProps {
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
}

const Sidebar = ({ isMobileMenuOpen, toggleMobileMenu }: SidebarProps) => {
  const [location] = useLocation();
  
  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    refetchInterval: 60000, // Refetch every minute
  });

  return (
    <aside className="bg-white shadow-lg md:w-64 w-full md:fixed md:h-full z-10">
      <div className="flex justify-between items-center p-4 border-b">
        <h1 className="text-2xl font-bold text-primary flex items-center">
          <CheckCircle className="h-8 w-8 mr-2" />
          YogiChal
        </h1>
        <button 
          onClick={toggleMobileMenu}
          className="md:hidden text-gray-500"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M4 6h16M4 12h16M4 18h16" 
            />
          </svg>
        </button>
      </div>
      
      <nav id="sidebar-menu" className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block p-4`}>
        <p className="text-xs uppercase font-semibold text-gray-500 mb-2">Main Menu</p>
        <Link href="/">
          <a className={`flex items-center p-2 rounded-lg mb-1 ${location === '/' ? 'text-primary bg-blue-50' : 'text-gray-600 hover:bg-gray-100'}`}>
            <LineChart className="h-5 w-5 mr-2" />
            Dashboard
          </a>
        </Link>
        <Link href="/progress">
          <a className={`flex items-center p-2 rounded-lg mb-1 ${location === '/progress' ? 'text-primary bg-blue-50' : 'text-gray-600 hover:bg-gray-100'}`}>
            <BarChart4 className="h-5 w-5 mr-2" />
            Progress
          </a>
        </Link>
        <Link href="/calendar">
          <a className={`flex items-center p-2 rounded-lg mb-1 ${location === '/calendar' ? 'text-primary bg-blue-50' : 'text-gray-600 hover:bg-gray-100'}`}>
            <CalendarDays className="h-5 w-5 mr-2" />
            Calendar
          </a>
        </Link>
        <Link href="/statistics">
          <a className={`flex items-center p-2 rounded-lg mb-1 ${location === '/statistics' ? 'text-primary bg-blue-50' : 'text-gray-600 hover:bg-gray-100'}`}>
            <BarChart4 className="h-5 w-5 mr-2" />
            Statistics
          </a>
        </Link>
        
        <div className="mt-8">
          <p className="text-xs uppercase font-semibold text-gray-500 mb-2">Your Challenge</p>
          <div className="bg-light p-3 rounded-lg">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm font-medium">{stats?.challengeProgress || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: `${stats?.challengeProgress || 0}%` }}
              ></div>
            </div>
            <div className="mt-4 text-sm">
              <div className="flex justify-between mb-1">
                <span>Days Completed:</span>
                <span className="font-medium">{stats?.daysCompleted || 0}/{stats?.totalDays || 180}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Current Streak:</span>
                <span className="font-medium text-secondary">{stats?.currentStreak || 0} days</span>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
