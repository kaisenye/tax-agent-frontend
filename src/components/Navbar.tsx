import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LuFileSearch, LuUser, LuSettings } from "react-icons/lu";
import { GrDocumentText, GrStorage } from "react-icons/gr";
import logo from '../assets/logo.svg';

const Navbar = () => {
  const [activeLink, setActiveLink] = useState<string>(window.location.pathname.slice(1) || 'research');
  const location = useLocation();

  useEffect(() => {
    // Extract the path from the current location (removes leading slash and gets the base route)
    const path = location.pathname.slice(1).split('/')[0];
    
    // If path is empty, default to 'research' otherwise set to the current path
    setActiveLink(path || 'research');
  }, [location.pathname]);

  const navLinks = [
    { id: 'research', icon: LuFileSearch, label: 'Research' },
    // { id: 'assistant', icon: GrDocumentText, label: 'Assistant' },
    { id: 'case', icon: GrStorage, label: 'Case' },
    { id: 'settings', icon: LuSettings, label: 'Settings' },
  ];
  const getLinkClassName = (linkId: string) => `
    flex 
    flex-row
    ${activeLink === linkId ? 'text-black' : 'text-black-light'}
    font-400
    text-xl
    items-center 
    px-3
    py-2
    rounded-md
    transition-colors 
    duration-150
    ${activeLink === linkId 
      ? 'bg-gray' 
      : 'hover:bg-gray hover:text-black'
    }
  `;

  return (
    <nav className="fixed left-0 top-0 h-screen w-56 bg-gray-light z-10 border-r border-gray p-4 flex flex-col">
      {/* Top Section with Logo and Navigation */}
      <div className="flex-1">
        {/* Logo Section */}
        <div className="flex items-center mb-8 mt-2 ml-4">
          <img src={logo} alt="Luca Logo" className="w-16 h-auto" />
        </div>

        {/* Navigation Links */}
        <ul className="flex flex-col gap-2">
          {navLinks.slice(0, -1).map(({ id, icon: Icon, label }) => (
            <li key={id}>
              <Link 
                to={`/${id}`}
                onClick={() => setActiveLink(id)}
                className={getLinkClassName(id)}
              >
                <Icon className="w-4 h-4" />
                <span className="ml-4">{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* User Section  */}
      <div className="flex flex-col gap-2 pt-4 pb-4 border-t border-gray">
        <div className="flex flex-row items-center gap-3 bg-gray rounded-md p-2 border border-gray-dark">
            <div className="w-6 h-6 bg-gray-light rounded-full flex items-center justify-center">
                <LuUser className="w-4 h-4" />
            </div>
            <span className="text-lg font-500 text-black-light">
                Joe Doe
            </span>
        </div>
        {navLinks.slice(-1).map(({ id, icon: Icon, label }) => (
          <Link 
            key={id}
            to={`/${id}`}
            onClick={() => setActiveLink(id)}
            className={getLinkClassName(id)}
          >
            <Icon className="w-4 h-4" />
            <span className="ml-4">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
