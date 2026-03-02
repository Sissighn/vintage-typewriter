import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>Vintage Typewriter</h1>
      <p className={styles.subtitle}>Mechanical Typing Station // 2026</p>
    </header>
  );
}
