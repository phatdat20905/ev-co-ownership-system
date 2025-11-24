import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { X } from "lucide-react";
import { getMenuItemsByRole } from "../../config/menuConfig";

/**
 * DashboardSidebar Component
 * Shared sidebar for Admin and Staff dashboards
 * 
 * @param {Object} props
 * @param {boolean} props.sidebarOpen - Desktop sidebar open state
 * @param {boolean} props.mobileMenuOpen - Mobile menu open state
 * @param {Function} props.setMobileMenuOpen - Mobile menu state setter
 * @param {string} props.userRole - User role ('admin' or 'staff')
 */
const DashboardSidebar = ({ 
  sidebarOpen, 
  mobileMenuOpen, 
  setMobileMenuOpen,
  userRole = "staff"
}) => {
  const location = useLocation();
  const menuItems = getMenuItemsByRole(userRole);

  const getActiveTab = () => {
    const currentPath = location.pathname;
    const menuItem = menuItems.find((item) => item.link === currentPath);
    return menuItem ? menuItem.id : "overview";
  };

  const activeTab = getActiveTab();

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ x: 0 }}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 shadow-sm z-30 hidden lg:block"
      >
        <div className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md">
              EV
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">EV Share</h1>
              <p className="text-xs text-gray-500 capitalize">
                {userRole === "admin" ? "Admin Dashboard" : "Staff Dashboard"}
              </p>
            </div>
          </div>
        </div>

        <nav className="px-3 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={item.link}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeTab === item.id
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </motion.aside>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Mobile Sidebar */}
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed left-0 top-0 h-screen w-64 bg-white shadow-xl z-50 lg:hidden overflow-y-auto"
            >
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md">
                      EV
                    </div>
                    <div>
                      <h1 className="text-lg font-bold text-gray-900">
                        EV Share
                      </h1>
                      <p className="text-xs text-gray-500 capitalize">
                        {userRole === "admin" ? "Admin Dashboard" : "Staff Dashboard"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <nav className="p-3 space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.id}
                    to={item.link}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      activeTab === item.id
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default DashboardSidebar;
