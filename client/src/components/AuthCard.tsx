import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import styles from "./AuthCard.module.css";
import { GoogleLogin } from "@react-oauth/google";

export default function AuthCard() {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) await login({ email, password });
      else await register({ email, password, name: email.split("@")[0] });
    } catch (err) {
      alert("Authentication failed. Please check your credentials.");
    }
  };

  return (
    <div className={styles.authOverlay}>
      <div className={styles.authCard}>
        <h2 className={styles.title}>
          {isLogin ? "RESUME SESSION" : "CREATE ACCOUNT"}
        </h2>

        {/* Google Login Section */}
        <div className={styles.googleWrapper}>
          <GoogleLogin
            onSuccess={(res) =>
              res.credential && console.log("Google login:", res.credential)
            }
            onError={() => console.log("Login Failed")}
            useOneTap
            shape="rectangular"
            theme="outline"
          />
        </div>

        <div className={styles.separator}>
          <span className={styles.separatorText}>OR</span>
        </div>

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

        <div className={styles.toggle} onClick={() => setIsLogin(!isLogin)}>
          {isLogin
            ? "Need an account? Register here."
            : "Already have an account? Sign in."}
        </div>
      </div>
    </div>
  );
}
