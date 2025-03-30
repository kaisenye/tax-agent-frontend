import { LuUser, LuLogOut } from "react-icons/lu";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const { userId, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row items-center gap-3 bg-gray rounded-md p-2 border border-gray-dark">
        <div className="w-6 h-6 bg-gray-light rounded-full flex items-center justify-center">
          <LuUser className="w-4 h-4" />
        </div>
        <span className="text-lg font-500 text-black-light">
          {userId || 'Guest'}
        </span>
      </div>
      <button 
        onClick={handleLogout}
        className="flex flex-row text-black-light font-400 text-xl items-center px-3 py-2 rounded-md transition-colors duration-150 hover:bg-gray hover:text-black"
      >
        <LuLogOut className="w-4 h-4" />
        <span className="ml-4">Logout</span>
      </button>
    </div>
  );
};

export default UserProfile; 