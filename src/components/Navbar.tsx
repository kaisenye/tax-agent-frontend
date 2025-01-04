import { useState } from 'react';
import { LuFileSearch } from "react-icons/lu";
import { GrDocumentText, GrStorage } from "react-icons/gr";

const Navbar = () => {
  const [activeLink, setActiveLink] = useState<string>('research'); // Default active link

  const navLinks = [
    { id: 'research', icon: LuFileSearch, label: 'Research' },
    { id: 'assistant', icon: GrDocumentText, label: 'Assistant' },
    { id: 'case', icon: GrStorage, label: 'Case' },
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
    <nav className="fixed left-0 top-0 h-screen w-56 bg-gray-light z-10 border-r border-gray p-4">
      {/* Logo Section */}
      <div className="flex items-center mb-8">
        <span className="text-xl font-semibold text-gray-800">Tax Agent</span>
      </div>

      {/* Navigation Links */}
      <div>
        <ul className="flex flex-col gap-2">
          {navLinks.map(({ id, icon: Icon, label }) => (
            <li key={id}>
              <a 
                href="#"
                onClick={() => setActiveLink(id)}
                className={getLinkClassName(id)}
              >
                <Icon className="w-5 h-5" />
                <span className="ml-4">{label}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
