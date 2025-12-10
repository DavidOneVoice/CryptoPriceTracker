import { useState } from "react";
import { auth } from "./Firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import "./Styles/AuthForm.css";

const AuthForm = ({ onAuth }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
      } else {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
      }
      onAuth(userCredential.user);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => setIsDarkTheme((prev) => !prev);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onAuth(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) return setError("Please enter your email to reset password.");
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent. Check your inbox.");
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div
      className={`app-container ${isDarkTheme ? "dark-theme" : "light-theme"}`}
    >
      <header
        className="app-header"
        style={{ backgroundColor: isDarkTheme ? "black" : "white" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h1>Crypto Tracker</h1>
        </div>
        <button className="theme-toggle" onClick={toggleTheme}>
          {isDarkTheme ? (
            <LightModeIcon style={{ color: "white" }} />
          ) : (
            <DarkModeIcon />
          )}
        </button>
      </header>
      <div
        className="auth-container"
        style={{ backgroundColor: isDarkTheme ? "black" : "white" }}
      >
        <h2 style={{ color: isDarkTheme ? "white" : "black" }}>
          {isLogin ? "Login" : "Sign Up"}
        </h2>

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            style={{ border: isDarkTheme ? "" : "2px solid black" }}
          />

          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              style={{ border: isDarkTheme ? "" : "2px solid black" }}
            />
            <span
              className="password-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
            </span>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Processing..." : isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        {error && <p className="auth-error">{error}</p>}

        {isLogin && (
          <p className="password-reset" onClick={handlePasswordReset}>
            Reset Password
          </p>
        )}

        <p
          className="toggle-text"
          style={{ color: isDarkTheme ? "" : "black" }}
        >
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <span onClick={() => setIsLogin(!isLogin)} className="toggle-link">
            {isLogin ? "Sign Up" : "Login"}
          </span>
        </p>

        {auth.currentUser && (
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </div>
  );
};

export default AuthForm;
