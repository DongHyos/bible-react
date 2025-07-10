import { useBookOpen } from '../../../shared/hooks/useBookOpen';
import BookCover from './BookCover';
import BookPages from './BookPages';
import styles from './BookOpeningAnimation.module.css';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useLayoutEffect } from 'react';
import BookReader from './BookReader';
import { BookProvider } from './BookContext';

function useBibleStructure() {
  return useQuery({
    queryKey: ['bible-structure'],
    queryFn: async () => {
      const res = await fetch('/api/bible/structure');
      const data = await res.json();
      return data.payload;
    },
    // --- 성능 최적화 ---
    // 성경 구조 데이터는 거의 변하지 않으므로, 24시간 동안 캐시합니다.
    // staleTime: 데이터가 '최신' 상태로 유지되는 시간
    // gcTime: 비활성 쿼리가 캐시에서 제거되기까지의 시간
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}

export default function BookOpeningAnimation() {
  const { isOpen, toggleBook } = useBookOpen();
  const { data, isLoading, isError } = useBibleStructure();
  // flat 뷰 상태에 'exiting' 추가
  const [flatViewState, setFlatViewState] = useState<'idle' | 'entering' | 'entered' | 'exiting'>('idle');
  const [selectedBook, setSelectedBook] = useState<any>(null);

  // 배경 클릭 핸들러: 책이 펼쳐진 상태에서만 동작
  const handleBackgroundClick = () => {
    if (isOpen && flatViewState === 'idle') toggleBook();
  };

  // 책 클릭 시 이벤트 버블링 방지
  const handleBookClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen && flatViewState === 'idle') toggleBook();
  };

  // 권 클릭 시 flat view로 전환 (책이 펼쳐진 상태에서만)
  const handleBookItemClick = (book: any) => {
    if (!isOpen) return;
    setSelectedBook(book);
    setFlatViewState('entering');
  };

  // flat 뷰에서 목차(3D)로 돌아가기
  const handleCloseReader = () => {
    // setFlatViewState('idle'); // 즉시 idle로 변경하는 대신 exiting 상태를 거치도록 수정
    // setSelectedBook(null);
    setFlatViewState('exiting');
  };

  // 트랜지션 끝나면 상태 변경
  const handleTransitionEnd = () => {
    if (flatViewState === 'entering') {
      setFlatViewState('entered');
    } else if (flatViewState === 'exiting') {
      setFlatViewState('idle');
      setSelectedBook(null);
    }
  };

  if (["entering", "entered", "exiting"].includes(flatViewState) && selectedBook) {
    const getFlatViewClass = () => {
      switch (flatViewState) {
        case "entering":
          return `${styles.bookFlat} ${styles.bookFlatEnter}`;
        case "entered":
          return `${styles.bookFlat} ${styles.bookFlatEnterActive}`;
        case "exiting":
          return `${styles.bookFlat} ${styles.bookFlatExit}`;
        default:
          return styles.bookFlat;
      }
    };

    // BookReader를 다시 컨테이너로 감싸서 중앙 정렬 및 애니메이션 적용
    return (
      <div className={styles.bookAnimationContainer}>
        <div className={getFlatViewClass()} onTransitionEnd={handleTransitionEnd}>
          <BookProvider>
            <BookReader book={selectedBook} onClose={handleCloseReader} />
          </BookProvider>
        </div>
      </div>
    );
  }

  if (isLoading) return <div className={styles.bookAnimationContainer}>로딩중...</div>;
  if (isError || !data) return <div className={styles.bookAnimationContainer}>데이터 오류</div>;

  const bookClass = `${styles.book} ${isOpen ? styles.bookOpen : ''}`;

  // 항상 BookCover와 BookPages를 동시에 렌더링
  return (
    <div className={styles.bookAnimationContainer} onClick={handleBackgroundClick}>
      <div className={bookClass} onClick={handleBookClick}>
        <BookCover isOpen={isOpen} />
        <BookPages
          isOpen={isOpen}
          oldCategories={data.구약}
          newCategories={data.신약}
          onBookClick={handleBookItemClick}
        />
      </div>
      {!isOpen && (
        <div className={styles.clickHint}>
          <p>📖 책을 클릭하여 펼쳐보세요</p>
        </div>
      )}
    </div>
  );
} 