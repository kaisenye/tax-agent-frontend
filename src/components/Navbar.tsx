import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LuFileSearch, LuUser, LuSettings } from "react-icons/lu";
import { GrDocumentText, GrStorage } from "react-icons/gr";

const Navbar = () => {
  const [activeLink, setActiveLink] = useState<string>(window.location.pathname.slice(1) || 'research');

  const navLinks = [
    { id: 'research', icon: LuFileSearch, label: 'Research' },
    { id: 'assistant', icon: GrDocumentText, label: 'Assistant' },
    { id: 'case', icon: GrStorage, label: 'Case' },
    { id: 'settings', icon: LuSettings, label: 'Settings' },
  ];

  const getLinkClassName = (linkId: string) => `
    flex 
    flex-row
    items-center 
    px-3
    py-2
    border
    rounded-md
    transition-colors 
    duration-150
    ${activeLink === linkId 
      ? 'bg-gray border-gray-dark' 
      : 'border-gray-light hover:bg-gray hover:border-gray-dark'
    }
  `;

  return (
    <nav className="fixed left-0 top-0 h-screen w-56 bg-gray-light z-10 border-r border-gray p-4 flex flex-col">
      {/* Top Section with Logo and Navigation */}
      <div className="flex-1">
        {/* Logo Section */}
        <div className="flex items-center mb-8">
          <span className="text-xl font-semibold text-gray-800">Tax Agent</span>
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
                <Icon className="w-5 h-5" />
                <span className="ml-4">{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* User Section  */}
      <div className="flex flex-col gap-2 pt-4 pb-4 border-t border-gray">
        <div className="flex flex-row items-center gap-2 bg-gray rounded-md p-2">
            <div className="w-6 h-6 bg-gray-light rounded-full flex items-center justify-center">
                <LuUser className="w-4 h-4" />
            </div>
            <span className="text-gray-800">
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
