import React from "react";
import { useAuth } from "../context/AuthContext";
import styles from "./Header.module.css";

export default function Header() {
  const { user, isGuest, logout } = useAuth();

  return (
    <header className={styles.header}>
      {/* 1. Titel & Subtitle (Zentriert durch text-align: center im Header) */}
      <h1 className={styles.title}>VINTAGE TYPEWRITER</h1>
      <p className={styles.subtitle}>MECHANICAL TYPING STATION // 2026</p>

      {/* 2. User Bereich (Absolut positioniert ganz rechts) */}
      <div className={styles.userSection}>
        {user ? (
          <div className={styles.userInfo}>
            {user.avatar && (
              <img src={user.avatar} alt="Avatar" className={styles.avatar} />
            )}
            <span className={styles.userName}>
              {user.name || user.email.split("@")[0]}
            </span>
            <button onClick={logout} className={styles.logoutBtn}>
              LOGOUT
            </button>
          </div>
        ) : isGuest ? (
          <div className={styles.userInfo}>
            <span className={styles.userName}>GUEST MODE</span>
            <button onClick={logout} className={styles.logoutBtn}>
              EXIT
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
