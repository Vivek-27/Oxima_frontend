import { useState } from 'react';
import { BiChevronDown } from 'react-icons/bi';
import {
  IoCarSportSharp,
  IoHelpCircle,
  IoLogOut,
  IoPerson,
  IoPricetag,
  IoReceipt,
  IoSearch,
  IoWallet
} from 'react-icons/io5';
import { Link, useHref, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const href = useHref();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const userData = localStorage?.getItem('user');
  const user = userData ? userData : null;
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsMenuOpen(false);
    navigate('/auth_login');
  };
  const Menu = () => (
    <ul className="absolute z-40 top-16 right-0 border bg-white text-black min-w-80 rounded-2xl w-fit py-5 px-4 shadow-2xl space-y-4 transition-all duration-300">
      <li className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">{user.name}</h1>
          <p className="text-sm text-gray-500">View Profile</p>
        </div>
        <img
          src={
            user.image ||
            'https://www.pngall.com/wp-content/uploads/5/Profile-PNG-File.png'
          }
          alt="User"
          onClick={toggleMenu}
          className="w-16 h-16 rounded-full object-cover border-2 border-gray-300 hover:scale-105 transition-transform cursor-pointer"
        />
      </li>

      <li className="flex justify-between gap-3">
        <Link
          to="/help"
          onClick={() => setIsMenuOpen(false)}
          className="bg-gray-100 hover:bg-gray-200 p-3 rounded-xl text-center w-24 h-24 flex flex-col items-center justify-center"
        >
          <IoHelpCircle className="text-3xl mb-1 text-gray-700" />
          <span className="text-sm font-medium">Help</span>
        </Link>
        <Link
          to="/wallet"
          onClick={() => setIsMenuOpen(false)}
          className="bg-gray-100 hover:bg-gray-200 p-3 rounded-xl text-center w-24 h-24 flex flex-col items-center justify-center"
        >
          <IoWallet className="text-3xl mb-1 text-gray-700" />
          <span className="text-sm font-medium">Wallet</span>
        </Link>
        <Link
          to="/rides"
          onClick={() => setIsMenuOpen(false)}
          className="bg-gray-100 hover:bg-gray-200 p-3 rounded-xl text-center w-24 h-24 flex flex-col items-center justify-center"
        >
          <IoReceipt className="text-3xl mb-1 text-gray-700" />
          <span className="text-sm font-medium">Activity</span>
        </Link>
      </li>

      <hr className="border-t border-gray-200" />

      <li className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 line-through rounded-lg cursor-pointer text-gray-800">
        <IoPerson className="text-xl" />
        <span className="font-medium">Manage Your Account</span>
      </li>
      <li className="flex items-center gap-3 px-4 py-3 line-through hover:bg-gray-100 rounded-lg cursor-pointer text-gray-800">
        <IoPricetag className="text-xl" />
        <span className="font-medium">Promotion</span>
      </li>

      <li
        onClick={handleLogout}
        className="flex items-center justify-center gap-3 px-4 py-3 mt-1 text-red-600 border border-red-500 rounded-lg hover:shadow-md hover:bg-red-50 cursor-pointer font-semibold"
      >
        <IoLogOut className="text-2xl" /> Sign Out
      </li>
    </ul>
  );

  if (href === '/auth_login' || href === '/auth_signup') {
    return (
      <nav className="fixed z-10 w-full bg-black text-white flex items-center justify-between px-10 h-16 shadow-md">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-2xl font-bold text-white">
            Oxima
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {href === '/auth_login' && (
            <Link
              to="/auth_signup"
              className="bg-white text-black rounded-full px-4 py-1 font-medium"
            >
              Sign up
            </Link>
          )}
          {href === '/auth_signup' && (
            <>
              <Link to="/auth_login">Log in</Link>
              <Link
                to="/auth_signup"
                className="bg-white text-black rounded-full px-4 py-1 font-medium"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed z-10 w-full bg-black text-white flex items-center justify-between h-16 px-8 md:px-32 shadow-md">
      <div className="flex items-center gap-6">
        <Link to="/" className="text-2xl font-bold text-white">
          Oxima
        </Link>
        <ul className="hidden md:flex gap-6 text-sm font-medium">
          <Link to="/rides">
            <li className="hover:underline">Ride</li>
          </Link>
          <Link to={'/about'} className="flex items-center gap-1">
            About <BiChevronDown />
          </Link>{' '}
          <a
            href="https://oximadriver.netlify.app/"
            className="flex items-center gap-2 justify-center"
          >
            Captin Page
          </a>
        </ul>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center bg-white rounded-full w-64 h-9 px-4">
          <IoSearch className="text-black text-lg" />
          <input
            disabled
            type="text"
            placeholder="Search Oxima.com"
            className="ml-2 w-full line-through text-sm text-black placeholder-gray-600 outline-none"
          />
        </div>
        <ul className="flex items-center gap-4 text-sm font-medium">
          <Link to="/help">Help</Link>
          {!user ? (
            <>
              <Link to="/auth_login">Log in</Link>
              <Link
                to="/auth_signup"
                className="bg-white text-black rounded-full px-4 py-1"
              >
                Sign up
              </Link>
            </>
          ) : (
            <div className="relative">
              <img
                src={
                  user.image ||
                  'https://www.pngall.com/wp-content/uploads/5/Profile-PNG-File.png'
                }
                alt="User"
                onClick={toggleMenu}
                className="w-10 h-10 rounded-full cursor-pointer border border-gray-300 hover:scale-105 transition-transform"
              />
              {isMenuOpen && <Menu />}
            </div>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
