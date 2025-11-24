import {
  BarChart3,
  Car,
  Users,
  FileText,
  Wrench,
  QrCode,
  AlertTriangle,
  PieChart,
  Building,
} from "lucide-react";

/**
 * Menu configuration for Admin role
 */
export const adminMenuItems = [
  {
    id: "overview",
    label: "Tổng quan",
    icon: <BarChart3 className="w-5 h-5" />,
    link: "/admin",
  },
  {
    id: "cars",
    label: "Quản lý xe",
    icon: <Car className="w-5 h-5" />,
    link: "/admin/cars",
  },
  {
    id: "staff",
    label: "Nhân viên",
    icon: <Users className="w-5 h-5" />,
    link: "/admin/staff",
  },
  {
    id: "contracts",
    label: "Hợp đồng",
    icon: <FileText className="w-5 h-5" />,
    link: "/admin/contracts",
  },
  {
    id: "services",
    label: "Dịch vụ xe",
    icon: <Wrench className="w-5 h-5" />,
    link: "/admin/services",
  },
  {
    id: "checkin",
    label: "Check in/out",
    icon: <QrCode className="w-5 h-5" />,
    link: "/admin/checkin",
  },
  {
    id: "disputes",
    label: "Tranh chấp",
    icon: <AlertTriangle className="w-5 h-5" />,
    link: "/admin/disputes",
  },
  {
    id: "reports",
    label: "Báo cáo TC",
    icon: <PieChart className="w-5 h-5" />,
    link: "/admin/financial-reports",
  },
];

/**
 * Menu configuration for Staff role
 */
export const staffMenuItems = [
  {
    id: "overview",
    label: "Tổng quan",
    icon: <BarChart3 className="w-5 h-5" />,
    link: "/staff",
  },
  {
    id: "cars",
    label: "Quản lý xe",
    icon: <Car className="w-5 h-5" />,
    link: "/staff/cars",
  },
  {
    id: "contracts",
    label: "Hợp đồng",
    icon: <FileText className="w-5 h-5" />,
    link: "/staff/contracts",
  },
  {
    id: "services",
    label: "Dịch vụ xe",
    icon: <Wrench className="w-5 h-5" />,
    link: "/staff/services",
  },
  {
    id: "checkin",
    label: "Check-in/out",
    icon: <QrCode className="w-5 h-5" />,
    link: "/staff/checkin",
  },
];

/**
 * Get menu items based on user role
 * @param {string} role - User role ('admin' or 'staff')
 * @returns {Array} Menu items array
 */
export const getMenuItemsByRole = (role) => {
  const normalizedRole = (role || "staff").toString().trim().toLowerCase();
  return normalizedRole === "admin" ? adminMenuItems : staffMenuItems;
};
