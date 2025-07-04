import { Route, Routes } from 'react-router';
import VerificationPage from './Components/VerificationPage';
import HomeDriver from './Components/HomeDriver';
import AuthDriver from './Components/AuthDriver';
import LoginPageDriver from './Components/LoginPageDriver';
import Navbar from './Components/Navbar';
import Wallet from './Components/Wallet';
import Rides from './Components/Rides';
import HelpPage from './Components/HelpPage';
import About from './Components/About';

function App() {
  return (
    <div className="px-10">
      <div className="flex flex-col items-center">
        <Navbar />

        <div className="mt-28">
          <Routes>
            <Route
              path="/auth_varification/:usertype/:id"
              element={<VerificationPage />}
            />

            <Route path="/" element={<HomeDriver />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/rides" element={<Rides />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/auth_signup" element={<AuthDriver />} />
            <Route path="/auth_login" element={<LoginPageDriver />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
