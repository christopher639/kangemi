import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaChurch, FaUsers, FaDonate, FaHome, FaUserCog, FaChartLine, FaCog } from 'react-icons/fa';
import { Tooltip } from '@mui/material';

const TopNavbar = () => {
  const linkClasses = ({ isActive }) =>
    `flex items-center justify-center px-3 py-3 md:py-2 rounded-md transition-colors duration-200 ${
      isActive ? 'bg-blue-700' : 'hover:bg-blue-700'
    }`;

  // Navigation items data
  const navItems = [
    { path: "/", icon: <FaHome size={20} />, label: "Dashboard" },
    { path: "/members", icon: <FaUsers size={20} />, label: "Members" },
    { path: "/contributions", icon: <FaDonate size={20} />, label: "Contributions" },
    { path: "/reports", icon: <FaChartLine size={20} />, label: "Reports" },
    { path: "/admin", icon: <FaUserCog size={20} />, label: "Admin" }
  ];

  return (
    <nav className="w-full bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand - Hidden on mobile to save space */}
          <div className="hidden md:flex flex-shrink-0 items-center">
            <FaChurch className="text-2xl mr-3 text-white" />
            <span className="text-xl font-semibold">ChurchMS</span>
          </div>
          
          {/* Primary Navigation - Desktop */}
          <div className="hidden md:flex flex-1 justify-center space-x-2">
            {navItems.map((item) => (
              <NavLink 
                key={item.path} 
                to={item.path} 
                className={linkClasses}
                end={item.path === "/"}
              >
                <span className="mr-2">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
          
          {/* Primary Navigation - Mobile */}
          <div className="md:hidden flex flex-1 justify-around">
            {navItems.map((item) => (
              <Tooltip key={item.path} title={item.label} arrow placement="bottom">
                <div className="flex-1 flex justify-center">
                  <NavLink 
                    to={item.path} 
                    className={`${linkClasses} w-full max-w-[60px] flex justify-center`}
                    end={item.path === "/"}
                  >
                    {item.icon}
                  </NavLink>
                </div>
              </Tooltip>
            ))}
          </div>
          
          {/* Settings (Right-aligned) */}
          <div className="flex items-center ml-2">
            <Tooltip title="Settings" arrow placement="bottom">
              <NavLink to="/settings" className={linkClasses}>
                <span className="hidden md:inline-block mr-2"><FaCog size={20} /></span>
                <span className="hidden md:inline">Settings</span>
                <span className="md:hidden"><FaCog size={20} /></span>
              </NavLink>
            </Tooltip>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNavbar;