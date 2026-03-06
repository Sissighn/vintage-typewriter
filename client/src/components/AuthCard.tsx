import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import styles from "./AuthCard.module.css";
import { GoogleLogin } from "@react-oauth/google";

export default function AuthCard() {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register, loginWithGoogle, continueAsGuest } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Funktion zur Berechnung der Passwortstärke (0 bis 4)
  const getStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[@$!%*?&]/.test(pass)) score++;
    return score;
  };

  const strength = getStrength(password);

  // Validierungs-Logik: 10+ Zeichen, Groß/Klein, Zahl, Sonderzeichen
  const validatePassword = (pass: string) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;
    return regex.test(pass);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Regeln nur bei Registrierung anwenden
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
      // Fehler vom Backend abfangen
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

        {/* Fehleranzeige */}
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
          <input
            type="password"
            placeholder="PASSWORD"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />

          {/* Stärken-Indikator nur bei Registrierung anzeigen */}
          {!isLogin && password.length > 0 && (
            <div className={styles.strengthMeterContainer}>
              <div className={styles.strengthLabel}>
                Security Level: {strength}/4
              </div>
              <div className={styles.strengthMeter}>
                <div
                  className={`${styles.strengthBar} ${styles[`level${strength}`]}`}
                  style={{ width: `${(strength / 4) * 100}%` }}
                />
              </div>
            </div>
          )}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "PROCESSING..." : isLogin ? "SIGN IN" : "REGISTER"}
          </button>
        </form>

        <div
          className={styles.toggle}
          onClick={() => {
            setIsLogin(!isLogin);
            setError(null);
            setPassword("");
          }}
        >
          {isLogin
            ? "Need an account? Register here."
            : "Already have an account? Sign in."}
        </div>

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
