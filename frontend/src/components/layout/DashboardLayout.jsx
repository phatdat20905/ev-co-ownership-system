import { useState } from "react";
import { motion } from "framer-motion";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";

/**
 * DashboardLayout Component
 * Main layout wrapper for Admin and Staff dashboard pages
 * Includes sidebar and header components
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content to be rendered
 * @param {string} props.userRole - User role ('admin' or 'staff')
 * @param {Array} props.notifications - Notifications array
 * @param {Function} props.onNotificationRead - Callback for marking notification as read
 */
const DashboardLayout = ({ 
  children, 
  userRole = "staff",
  notifications = [],
  onNotificationRead = () => {},
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <DashboardSidebar
        sidebarOpen={sidebarOpen}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        userRole={userRole}
      />

      {/* Header */}
      <DashboardHeader
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        userRole={userRole}
        notifications={notifications}
        onNotificationRead={onNotificationRead}
      />

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`pt-16 transition-all duration-300 ${
          sidebarOpen ? "lg:ml-64" : "lg:ml-0"
        }`}
      >
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </motion.main>
    </div>
  );
};

export default DashboardLayout;
