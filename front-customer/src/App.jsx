import { Route, Routes } from 'react-router';
import VerificationPage from './Components/VerificationPage';
import Home from './Components/Home';
import Auth from './Components/Auth';
import Navbar from './Components/Navbar';
import LoginPage from './Components/LoginPage';
import About from './Components/About';
import HelpPage from './Components/HelpPage';
import Rides from './Components/Rides';
import Wallet from './Components/Wallet';

function App() {
  return (
    <div className="px-10">
      <div className="flex flex-col items-center">
        <Navbar />
        <div className="mt-28">
          <Routes>
            <Route path="/" element={<Home />} />

            <Route path="/wallet" element={<Wallet />} />
            <Route path="/rides" element={<Rides />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/auth_signup" element={<Auth />} />
            <Route path="/auth_login" element={<LoginPage />} />
            <Route
              path="/auth_varification/:usertype/:id"
              element={<VerificationPage />}
            />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
