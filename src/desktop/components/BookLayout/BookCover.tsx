import styles from './BookOpeningAnimation.module.css';

export default function BookCover({ isOpen }: { isOpen: boolean }) {
  return (
    <div className={isOpen ? `${styles.bookCover} ${styles.bookOpen}` : styles.bookCover}>
      {/* <div className={styles.bookSpine}>
        <div className={styles.bookTitle}>성경</div>
        <div className={styles.bookSubtitle}>66권</div>
      </div> */}
      <div className={styles.bookFront}>
        <div className={styles.bookCoverTitle}>
          <h2>Bible</h2>
          <p>구약 39권 · 신약 27권</p>
          <div className={styles.bookCoverIcon}>📖</div>
        </div>
      </div>
    </div>
  );
} 