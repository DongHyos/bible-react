import { useQuery } from '@tanstack/react-query';
import { useState, useMemo, useEffect, useLayoutEffect, useRef } from 'react';
import styles from './BookReader.module.css';
import SermonPreview from './SermonPreview';
import SermonModal from './SermonModal';
import { useRecentVerses } from '../../../hooks/useRecentVerses';
import type { RecentVerse } from '../../../types/bible';
import React from 'react';
import type { Book, Verse, Sermon } from '../../../types/bible';
import { useBookContext } from './BookContext';

interface BookReaderProps {
  book: Book;
  onClose: () => void;
}

// --- Custom Hooks ---

// 창 크기를 감지하는 훅
function useWindowSize() {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  useLayoutEffect(() => {
    function updateSize() {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  return size;
}

function TodayVerseTab({ onJump }: { onJump: (bookId: number, bookName: string, chapter: number, verse: number) => void }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['daily-verse', 'today'],
    queryFn: async () => {
      const res = await fetch('/api/daily-verse/today');
      if (!res.ok) throw new Error('오늘의 말씀을 불러올 수 없습니다.');
      const json = await res.json();
      return json.payload;
    }
  });

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>오류가 발생했습니다.</div>;
  if (!data) return <div>오늘의 말씀이 없습니다.</div>;

  // 구절 텍스트를 절 번호를 기준으로 나누어 각 절을 별도의 요소로 만듦
  const verses = data.verseText.trim().split(/\s+(?=\d+\s)/);

  return (
    <div className={styles.todayVerseContainer}>
      <h3 className={styles.todayVerseTitle}>
        <span role="img" aria-label="calendar icon" className={styles.todayVerseTitleIcon}>🗓️</span>
        {data.title}
      </h3>
      <p
        className={styles.todayVerseRef}
        onClick={() => onJump(data.bookId, data.bookName, data.chapter, data.verseStart)}
      >
        {data.verseReference}
      </p>
      <div className={styles.todayVerseTextContainer}>
        {verses.map((verse: string, index: number) => {
          const numberMatch = verse.match(/^(\d+)\s/);
          if (numberMatch) {
            const number = numberMatch[1];
            const text = verse.substring(numberMatch[0].length);
            return (
              <p key={index} className={styles.todayVerseItem}>
                <span className={styles.todayVerseNumber}>{number}</span>
                {text}
              </p>
            );
          }
          return (
            <p key={index} className={styles.todayVerseItem}>
              {verse}
            </p>
          );
        })}
      </div>
      <p className={styles.todayVerseDesc}>{data.description}</p>
    </div>
  );
}

export default function BookReader({ book, onClose }: BookReaderProps) {
  // --- STATE MANAGEMENT ---
  const {
    book: contextBook, setBook,
    chapter, setChapter,
    page, setPage,
    selectedVerse, setSelectedVerse,
    activeTab, setActiveTab
  } = useBookContext();
  const [paginatedVerses, setPaginatedVerses] = useState<Verse[][]>([]);
  const [isCalculating, setIsCalculating] = useState<boolean>(true);

  const desiredInitialPage = useRef<'first' | 'last'>('first'); // 'last'로 설정하면 챕터 변경 시 마지막 페이지로 이동

  const [isSermonModalOpen, setIsSermonModalOpen] = useState(false);
  const { recentVerses, addRecentVerse } = useRecentVerses();
  const [jumpTarget, setJumpTarget] = useState<RecentVerse | null>(null);
  const jumpJustCompletedRef = useRef(false);

  // --- REFS for measurement ---
  const pageRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const versesContainerRef = useRef<HTMLDivElement>(null);
  const measurementContainerRef = useRef<HTMLDivElement>(null);

  const windowSize = useWindowSize(); // 창 크기 감지

  // --- DATA FETCHING ---
  const { data: verses, isLoading, isError, isSuccess } = useQuery<Verse[]>({
    queryKey: ['chapter', book.id, chapter],
    queryFn: async () => {
      const res = await fetch(`/api/bible/books/${book.id}/chapters/${chapter}`);
      if (!res.ok) throw new Error('서버 오류');
      const json = await res.json();
      return json.payload.verses as Verse[];
    },
  });

  // 설교 데이터 호출
  const { 
    data: sermonData, 
    isLoading: isSermonLoading, 
    isError: isSermonError 
  } = useQuery<Sermon[]>({
    queryKey: ['sermons', book.id, chapter, selectedVerse?.verse],
    queryFn: async () => {
      if (!selectedVerse) return [];
      const res = await fetch(`/api/sermons/verse/${book.id}/${chapter}/${selectedVerse.verse}`);
      if (!res.ok) {
        throw new Error('설교 데이터를 불러오는 데 실패했습니다.');
      }
      const data = await res.json();
      return data.payload as Sermon[] ?? [];
    },
    enabled: !!selectedVerse, // selectedVerse가 있을 때만 쿼리 실행
  });

  // --- DYNAMIC PAGINATION EFFECT ---
  useLayoutEffect(() => {
    if (!verses || verses.length === 0 || !pageRef.current || !versesContainerRef.current || !measurementContainerRef.current) {
      return;
    }
    document.fonts.ready.then(() => {
      if (!versesContainerRef.current || !measurementContainerRef.current) {
        return;
      }
      setIsCalculating(true);
      const availableWidth = versesContainerRef.current.clientWidth;
      const realStyles = window.getComputedStyle(versesContainerRef.current);
      measurementContainerRef.current.style.width = `${availableWidth}px`;
      measurementContainerRef.current.style.fontFamily = realStyles.fontFamily;
      measurementContainerRef.current.style.fontSize = realStyles.fontSize;
      measurementContainerRef.current.style.lineHeight = realStyles.lineHeight;
      measurementContainerRef.current.style.letterSpacing = realStyles.letterSpacing;
      const availableHeight = versesContainerRef.current.clientHeight;
      if (availableHeight <= 0) {
        setIsCalculating(false);
        return;
      }
      const newPages: Verse[][] = [];
      let currentPage: Verse[] = [];
      const tempVerseElements = verses.map((verse: Verse) => {
        const verseEl = document.createElement('div');
        verseEl.className = styles.verse;
        const verseNumber = document.createElement('span');
        verseNumber.className = styles.verseNumber;
        verseNumber.textContent = String(verse.verse);
        verseEl.appendChild(verseNumber);
        verseEl.appendChild(document.createTextNode(verse.text));
        measurementContainerRef.current?.appendChild(verseEl);
        return { element: verseEl, verseData: verse };
      });
      let currentPageHeight = 0;
      tempVerseElements.forEach(({ element, verseData }: { element: HTMLElement, verseData: Verse }) => {
        const style = window.getComputedStyle(element);
        const verseHeight = element.offsetHeight + parseInt(style.marginBottom, 10);
        if (currentPageHeight + verseHeight > availableHeight && currentPage.length > 0) {
          newPages.push(currentPage);
          currentPage = [verseData];
          currentPageHeight = verseHeight;
        } else {
          currentPage.push(verseData);
          currentPageHeight += verseHeight;
        }
      });
      if (currentPage.length > 0) {
        newPages.push(currentPage);
      }
      if (measurementContainerRef.current) {
        measurementContainerRef.current.innerHTML = '';
      }
      setPaginatedVerses(newPages);
      setIsCalculating(false);
    });
  }, [verses, windowSize]);

  // 구절 점프, 페이지 이동, 상태 초기화를 모두 관장하는 메인 useEffect
  useEffect(() => {
    if (jumpJustCompletedRef.current) {
      jumpJustCompletedRef.current = false;
      return;
    }

    if (!verses || verses.length === 0) {
      if (paginatedVerses.length > 0) {
        setPaginatedVerses([]);
      }
      return;
    }

    // 페이지 계산이 아직 안 끝났으면 대기
    if (paginatedVerses.length === 0 && verses.length > 0) return;

    // 점프 목표가 있을 경우, 최우선으로 처리
    if (jumpTarget) {
      let foundPage = -1;
      let foundVerse = null;
      for (let i = 0; i < paginatedVerses.length; i++) {
        const verse = paginatedVerses[i].find(v =>
          jumpTarget.id !== -1 ? v.id === jumpTarget.id : v.verse === jumpTarget.verse
        );
        if (verse) {
          foundPage = i;
          foundVerse = verse;
          break;
        }
      }

      if (foundPage !== -1 && foundVerse) {
        setPage(foundPage + 1);
        setSelectedVerse(foundVerse);
        jumpJustCompletedRef.current = true;
        setJumpTarget(null);
      }
    } else {
      // 기존 page/selectedVerse가 새 paginatedVerses 내에 존재하면 유지, 아니면 초기화
      let shouldReset = false;
      let foundPage = -1;
      // page가 유효한지 체크
      if (page < 1 || page > paginatedVerses.length) {
        shouldReset = true;
      }
      // selectedVerse가 유효한지 체크 및 페이지 이동
      if (selectedVerse) {
        foundPage = paginatedVerses.findIndex(pageArr =>
          pageArr.some(v => v.id === selectedVerse.id)
        );
        if (foundPage === -1) {
          shouldReset = true;
        } else if (page !== foundPage + 1) {
          setPage(foundPage + 1);
        }
      }
      if (shouldReset) {
        setSelectedVerse(null);
        setActiveTab('info');
        setPage(1);
      }
      // 그렇지 않으면 기존 상태 유지
      desiredInitialPage.current = 'first';
    }
  }, [verses, paginatedVerses, jumpTarget]);

  const currentVerses = paginatedVerses[page - 1] || [];

  // --- EVENT HANDLERS ---
  const goToChapter = (newChapter: number) => {
    if (newChapter >= 1 && newChapter <= book.chapters) {
      setChapter(newChapter);
    }
  };

  const jumpToVerse = (verse: RecentVerse) => {
    if (verse.bookId !== book.id) {
      alert(`'${verse.bookName}'(으)로 이동하는 기능은 아직 준비중입니다.`);
      return;
    }
    setJumpTarget(verse);
    if (verse.chapter !== chapter) {
      setChapter(verse.chapter);
    }
  };

  const goPrevChapter = () => goToChapter(chapter - 1);
  const goNextChapter = () => goToChapter(chapter + 1);

  const totalPages = paginatedVerses.length;
  const goPrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    } else if (chapter > 1) {
      desiredInitialPage.current = 'last';
      goPrevChapter();
    }
  };
  const goNextPage = () => (page < totalPages ? setPage(page + 1) : goNextChapter());

  const handleVerseClick = (verse: Verse) => {
    setSelectedVerse(verse);
    setActiveTab('sermon');
    addRecentVerse({
      id: verse.id,
      bookId: book.id,
      bookName: book.name,
      chapter: chapter,
      verse: verse.verse,
      text: verse.text,
      timestamp: Date.now(),
    });
  };

  const TabButton = ({ id, label, icon }: { id: string, label: string, icon: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`${styles.tabButton} ${activeTab === id ? styles.active : ''}`}
    >
      <span role="img" aria-label={label}>{icon}</span> {label}
    </button>
  );

  // props.book이 바뀔 때 Context 동기화 및 상태 초기화
  useEffect(() => {
    setBook(book);
    setChapter(1);
    setPage(1);
    setSelectedVerse(null);
    setActiveTab('info');
  }, [book]);

  return (
    <div className={styles.container}>
      {/* --- HEADER --- */}
      <header className={styles.header}>
        <div className={styles.headerWrapper}>
          <div className={styles.title}>
            <span role="img" aria-label="bible" className={styles.titleIcon}>📖</span> 성경 설교 관리 도구
          </div>
          <div className={styles.headerControls}>
            <input type="text" placeholder="구절, 단어, 주제 검색..." className={styles.searchInput} />
            <button onClick={onClose} className={styles.closeButton}>
              ← 목차로
            </button>
          </div>
        </div>
      </header>

      {/* --- BOOK LAYOUT --- */}
      <main className={styles.mainContent}>
        <div className={styles.bookLayout}>
          {/* --- LEFT PAGE (BIBLE TEXT) --- */}
          <div ref={pageRef} className={styles.page}>
            <h2 ref={titleRef} className={styles.pageTitle}>{book.name} {chapter}장</h2>
            {isLoading && <div>로딩중...</div>}
            {isError && <div>본문을 불러올 수 없습니다.</div>}
            {isCalculating && <div>페이지 계산중...</div>}
            
            <div ref={versesContainerRef} className={styles.versesContainer}>
              {!isCalculating && (
                <>
                  {currentVerses.map((verse: Verse) => {
                    return (
                      <div 
                        key={verse.id} 
                        onClick={() => handleVerseClick(verse)} 
                        className={`${styles.verse} ${
                          selectedVerse && (
                            (selectedVerse.id !== -1 && selectedVerse.id === verse.id) ||
                            (selectedVerse.id === -1 && selectedVerse.verse === verse.verse)
                          ) ? styles.selected : ''
                        }`}
                      >
                        <span className={styles.verseNumber}>{verse.verse}</span>
                        {verse.text}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
            
            {/* 측정 전용 숨겨진 컨테이너 */}
            <div ref={measurementContainerRef} style={{ position: 'absolute', visibility: 'hidden', zIndex: -1, padding: '0', margin: '0' }} />
          </div>

          {/* --- RIGHT PAGE (TABS) --- */}
          <div className={styles.page}>
            <div className={styles.tabContainer}>
              <TabButton id="info" icon="📖" label="장 정보" />
              <TabButton id="today" icon="📅" label="오늘의 말씀" />
              <TabButton id="recent" icon="⏰" label="최근 본 구절" />
              {selectedVerse && <TabButton id="sermon" icon="🎥" label="설교 자료" />}
            </div>
            <div className={styles.tabContent}>
              {activeTab === 'info' && (
                <div>
                  <h3 className={styles.tabContentTitle}>📖 {book.name} {chapter}장 정보</h3>
                  <p>• 총 {book.chapters}장으로 구성</p>
                  <p>• 분류: {book.category?.name || '-'} / {book.testament}</p>
                  <p className={styles.placeholderText}>[장에 대한 개요, 핵심 구절 등 AI 요약 정보가 여기에 표시됩니다.]</p>
                </div>
              )}
              {activeTab === 'today' && (
                <div>
                  <TodayVerseTab
                    onJump={(bookId, bookName, chapter, verse) => {
                      if (bookId !== book.id) {
                        alert(`'${bookName}'(으)로 이동하는 기능은 아직 준비중입니다. 현재 책인 '${book.name}' 내에서만 이동할 수 있습니다.`);
                        return;
                      }
                      jumpToVerse({
                        id: -1, // 오늘의 말씀은 ID가 없으므로 verse 번호로 점프
                        bookId,
                        bookName,
                        chapter,
                        verse,
                        text: '',
                        timestamp: Date.now(),
                      });
                    }}
                  />
                </div>
              )}
              {activeTab === 'recent' && (
                <div>
                  <h3 className={styles.tabContentTitle}>⏰ 최근 본 구절</h3>
                  {recentVerses.length === 0 ? (
                    <p className={styles.placeholderText}>아직 최근에 본 구절이 없습니다.</p>
                  ) : (
                    <ul className={styles.recentVersesList}>
                      {recentVerses.map((verse: RecentVerse) => (
                        <li key={`${verse.bookId}-${verse.chapter}-${verse.verse}-${verse.timestamp}`} onClick={() => jumpToVerse(verse)} className={styles.recentVerseItem}>
                          <span className={styles.recentVerseRef}>{verse.bookName} {verse.chapter}:{verse.verse}</span>
                          <p className={styles.recentVerseText}>{verse.text}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              {activeTab === 'sermon' && selectedVerse && (
                <SermonPreview 
                  book={book} 
                  chapter={chapter} 
                  verse={selectedVerse.verse}
                  sermons={sermonData ?? []}
                  isLoading={isSermonLoading}
                  error={isSermonError}
                  onShowMore={() => setIsSermonModalOpen(true)}
                />
              )}
            </div>
          </div>
        </div>

        {/* --- NAVIGATION --- */}
        <div className={styles.navigation}>
          <button onClick={goPrevChapter} disabled={chapter === 1} className={styles.navButton}>|◀ 이전 장</button>
          <button onClick={goPrevPage} disabled={chapter === 1 && page === 1} className={styles.navButton}>◀ 이전</button>
          <span className={styles.navInfo}>{chapter}장 {page}/{totalPages || 1}페이지</span>
          <button onClick={goNextPage} disabled={chapter === book.chapters && page === totalPages} className={styles.navButton}>다음 ▶</button>
          <button onClick={goNextChapter} disabled={chapter === book.chapters} className={styles.navButton}>다음 장 ▶|</button>
        </div>
      </main>
      
      {isSermonModalOpen && sermonData && (
        <SermonModal 
          sermons={sermonData ?? []}
          onClose={() => setIsSermonModalOpen(false)} 
        />
      )}
    </div>
  );
} 