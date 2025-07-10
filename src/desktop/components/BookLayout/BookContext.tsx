import React, { createContext, useContext, useState } from 'react';
import type { Book, Verse } from '../../../types/bible';

interface BookContextType {
  book: Book | null;
  setBook: (book: Book | null) => void;
  chapter: number;
  setChapter: (chapter: number) => void;
  page: number;
  setPage: (page: number) => void;
  selectedVerse: Verse | null;
  setSelectedVerse: (verse: Verse | null) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const BookContext = createContext<BookContextType | undefined>(undefined);

export const BookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [book, setBook] = useState<Book | null>(null);
  const [chapter, setChapter] = useState<number>(1);
  const [page, setPage] = useState<number>(1);
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);
  const [activeTab, setActiveTab] = useState<string>('info');

  return (
    <BookContext.Provider value={{ book, setBook, chapter, setChapter, page, setPage, selectedVerse, setSelectedVerse, activeTab, setActiveTab }}>
      {children}
    </BookContext.Provider>
  );
};

export function useBookContext() {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error('useBookContext는 BookProvider 내에서만 사용할 수 있습니다.');
  }
  return context;
} 