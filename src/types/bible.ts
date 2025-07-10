/**
 * 성경 관련 핵심 데이터 타입 정의
 */

// 성경 책 정보
export interface Book {
  id: number;
  name: string;
  abbr: string;
  chapters: number;
  testament: '구약' | '신약';
  category?: {
    id: number;
    name: string;
  };
}

// 구절 정보
export interface Verse {
  id: number;
  bookId: number;
  chapter: number;
  verse: number;
  text: string;
}

// 설교 정보
export interface Sermon {
  id: number;
  title: string;
  preacher: string;
  date: string; // ISO 8601 format: "YYYY-MM-DD"
  youtubeUrl?: string;
  content: string;
  verseId: number;
  // 실제 서비스에서 추가로 사용되는 필드들
  pastorName?: string;
  churchName?: string;
  sermonDate?: string; // YYYY-MM-DD
  thumbnailUrl?: string;
  tags?: string[];
}

// 최근 본 구절 정보 (localStorage에 저장되는 형태)
export interface RecentVerse {
  id: number;
  bookId: number;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
  timestamp: number;
}

// 오늘의 말씀 정보
export interface DailyVerse {
  id: number;
  verseDate: string; // "YYYY-MM-DD"
  bookId: number;
  bookName: string;
  bookAbbr: string;
  chapter: number;
  verseStart: number;
  verseEnd: number | null;
  title: string;
  description: string;
  verseText: string;
  verseReference: string;
}

// API 응답을 위한 제네릭 타입
export interface ApiResponse<T> {
  status: number;
  code: string;
  message: string;
  payload: T;
  meta?: {
    path: string;
    timestamp: string;
    timeTaken: string;
  };
}

// 카테고리 정보
export interface Category {
  id: number;
  name: string;
  books: Book[];
}

// BookReader 탭 타입
export type BookReaderTab = 'info' | 'today' | 'recent' | 'sermon';

// SermonPreview 컴포넌트 props
export interface SermonPreviewProps {
  book: Book;
  chapter: number;
  verse: number;
  sermons: Sermon[];
  isLoading: boolean;
  error: boolean;
  onShowMore: () => void;
}

// SermonModal 컴포넌트 props
export interface SermonModalProps {
  sermons: Sermon[];
  onClose: () => void;
}

// useRecentVerses 커스텀 훅 반환 타입
export interface UseRecentVersesResult {
  recentVerses: RecentVerse[];
  addRecentVerse: (verse: RecentVerse) => void;
} 