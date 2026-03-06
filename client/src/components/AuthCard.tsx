import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import styles from "./AuthCard.module.css";
import { GoogleLogin } from "@react-oauth/google";

export default function AuthCard() {
  // --- States ---
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login, register, loginWithGoogle, continueAsGuest } = useAuth();

  // --- Logik: Passwortstärke & Validierung ---
  const getStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[@$!%*?&]/.test(pass)) score++;
    return score;
  };

  const strength = getStrength(password);

  const validatePassword = (pass: string) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;
    return regex.test(pass);
  };

  // --- Handlers ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validierung nur bei Registrierung
    if (!isLogin && !validatePassword(password)) {
      setError(
        "PASSWORD TOO WEAK: NEED 10+ CHARS, UPPER/LOWER CASE, NUMBER & SYMBOL.",
      );
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        await login({ email, password });
      } else {
        await register({ email, password, name: email.split("@")[0] });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "AUTHENTICATION FAILED.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      if (credentialResponse.credential) {
        await loginWithGoogle(credentialResponse.credential);
      }
    } catch (err) {
      setError("GOOGLE AUTHENTICATION FAILED.");
    }
  };

  return (
    <div className={styles.authOverlay}>
      <div className={styles.authCard}>
        <h2 className={styles.title}>
          {isLogin ? "RESUME SESSION" : "CREATE ACCOUNT"}
        </h2>

        {/* Google Login Bereich */}
        <div className={styles.googleWrapper}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("GOOGLE LOGIN FAILED.")}
            useOneTap
            shape="rectangular"
            theme="outline"
            width="100%"
          />
        </div>

        <div className={styles.separator}>
          <span className={styles.separatorText}>OR</span>
        </div>

        {/* Fehlermeldungen */}
        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="email"
            placeholder="EMAIL ADDRESS"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />

          <div className={styles.inputContainer}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="PASSWORD"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            <button
              type="button"
              className={styles.toggleVisibility}
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? "HIDE" : "SHOW"}
            </button>
          </div>

          {/* Stärken-Indikator (Nur bei Registrierung & wenn Passwort existiert) */}
          {!isLogin && password.length > 0 && (
            <div className={styles.strengthMeterContainer}>
              <div className={styles.strengthLabel}>
                SECURITY LEVEL: {strength}/4
              </div>
              <div className={styles.strengthMeter}>
                <div
                  className={`${styles.strengthBar} ${styles[`level${strength}`]}`}
                  style={{ width: `${Math.max((strength / 4) * 100, 5)}%` }} // Mindestens 5% Breite für Level 0
                />
              </div>
            </div>
          )}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "PROCESSING..." : isLogin ? "SIGN IN" : "REGISTER"}
          </button>
        </form>

        {/* Wechsel zwischen Login/Register */}
        <div
          className={styles.toggle}
          onClick={() => {
            setIsLogin(!isLogin);
            setError(null);
            setPassword("");
            setShowPassword(false);
          }}
        >
          {isLogin
            ? "Need an account? Register here."
            : "Already have an account? Sign in."}
        </div>

        {/* Guest Mode */}
        <button
          type="button"
          onClick={continueAsGuest}
          className={styles.guestBtn}
          disabled={loading}
        >
          CONTINUE AS GUEST
        </button>
      </div>
    </div>
  );
}
