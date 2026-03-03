import { useAuth } from "../context/AuthContext";
import styles from "./Header.module.css";

/**
 * Header Component
 * Maintains the original centered design while adding user actions.
 * Copyright 2026 Setayesh Golshan.
 */
export default function Header() {
  const { user, logout } = useAuth(); // Zugriff auf die Auth-Daten

  return (
    <header className={styles.header}>
      {/* Zentraler Titel-Bereich (Design bleibt unverändert) */}
      <div className={styles.logoWrapper}>
        <h1 className={styles.title}>Vintage Typewriter</h1>
        <p className={styles.subtitle}>Mechanical Typing Station // 2026</p>
      </div>

      {/* Rechtsbündiger Benutzer-Bereich (wird nur angezeigt, wenn eingeloggt) */}
      {user && (
        <div className={styles.userSection}>
          <div className={styles.userInfo}>
            {user.avatar && (
              <img src={user.avatar} alt="Profile" className={styles.avatar} />
            )}
            <span className={styles.userName}>{user.name || "Writer"}</span>
          </div>

          <button
            onClick={logout}
            className={styles.logoutBtn}
            aria-label="Sign out"
          >
            LOGOUT
          </button>
        </div>
      )}
    </header>
  );
}
