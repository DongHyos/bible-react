import BookPage from './BookPage';
import styles from './BookOpeningAnimation.module.css';
import type { Category, Book } from '../../../types/bible';

export default function BookPages({ isOpen, oldCategories, newCategories, onBookClick }: { isOpen: boolean, oldCategories: Category[], newCategories: Category[], onBookClick?: (book: Book) => void }) {
  return (
    <div className={isOpen ? styles.bookPagesOpen : styles.bookPages}>
      <BookPage side="left" categories={oldCategories} onBookClick={onBookClick} />
      <BookPage side="right" categories={newCategories} onBookClick={onBookClick} />
    </div>
  );
} 