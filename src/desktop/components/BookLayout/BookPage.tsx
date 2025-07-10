import BookCategoryList from './BookCategoryList';
import styles from './BookOpeningAnimation.module.css';
import type { Category, Book } from '../../../types/bible';
import React, { useState } from 'react';

export default function BookPage({ side, categories, onBookClick }: { side: 'left' | 'right', categories: Category[], onBookClick?: (book: Book) => void }) {
  const isOld = side === 'left';
  const [showScrollbar, setShowScrollbar] = useState(false);
  return (
    <div
      className={
        isOld
          ? `${styles.bookPage} ${styles.bookPageLeft} ${showScrollbar ? styles.showScrollbar : styles.hideScrollbar}`
          : `${styles.bookPage} ${showScrollbar ? styles.showScrollbar : styles.hideScrollbar}`
      }
      onMouseEnter={() => setShowScrollbar(true)}
      onMouseLeave={() => setShowScrollbar(false)}
    >
      <div className={styles.pageHeader}>
        <h3>{isOld ? '🕊️ 구약성경' : '✝️ 신약성경'}</h3>
        <span className={styles.pageCount}>{isOld ? '39권' : '27권'}</span>
      </div>
      <div className={styles.pageContent}>
        <BookCategoryList categories={categories} onBookClick={onBookClick} />
      </div>
    </div>
  );
} 