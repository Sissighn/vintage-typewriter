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

  // Validierungs-Logik: 10+ Zeichen, Groß/Klein, Zahl, Sonderzeichen
  const validatePassword = (pass: string) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;
    return regex.test(pass);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Regeln nur bei Registrierung anwenden
    if (!isLogin && !validatePassword(password)) {
      setError(
        "PASSWORD TOO WEAK: NEED 10+ CHARS, UPPER/LOWER CASE, NUMBER & SYMBOL.",
      );
      return;
    }

    try {
      if (isLogin) {
        await login({ email, password });
      } else {
        await register({ email, password, name: email.split("@")[0] });
      }
    } catch (err: any) {
      // Fehler vom Backend abfangen (z.B. "Email already in use")
      setError(err.response?.data?.message || "AUTHENTICATION FAILED.");
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
            onSuccess={(res) =>
              res.credential && loginWithGoogle(res.credential)
            }
            onError={() => setError("GOOGLE LOGIN FAILED.")}
            useOneTap
            shape="rectangular"
            theme="outline"
          />
        </div>

        <div className={styles.separator}>
          <span className={styles.separatorText}>OR</span>
        </div>

        {/* Fehleranzeige im Schreibmaschinen-Stil */}
        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="email"
            placeholder="EMAIL ADDRESS"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="PASSWORD"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className={styles.submitBtn}>
            {isLogin ? "SIGN IN" : "REGISTER"}
          </button>
        </form>

        <div
          className={styles.toggle}
          onClick={() => {
            setIsLogin(!isLogin);
            setError(null);
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
        >
          CONTINUE AS GUEST
        </button>
      </div>
    </div>
  );
}
