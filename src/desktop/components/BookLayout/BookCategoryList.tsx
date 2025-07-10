import styles from './BookOpeningAnimation.module.css';
import type { Category, Book } from '../../../types/bible';

export default function BookCategoryList({ categories, onBookClick }: { categories: Category[], onBookClick?: (book: Book) => void }) {
  return (
    <div>
      {categories.map((cat: Category) => (
        <div key={cat.id} className={styles.bookCategory}>
          <h4>{cat.name}</h4>
          <ul>
            {cat.books.map((book: Book) => (
              <li key={book.id} className={styles.bookItem} onClick={() => onBookClick?.(book)}>
                <span className={styles.bookItemTitle}>{book.name}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
} 