import { useEffect, useState } from 'react';
import BookOpeningAnimation from './desktop/components/BookLayout';
import { BookProvider } from './desktop/components/BookLayout/BookContext';

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);
  return matches;
}

function DesktopApp() {
  return (
    <BookProvider>
      <BookOpeningAnimation />
    </BookProvider>
  );
}

function MobileApp() {
  return <div>모바일 첫 화면 (추후 구현)</div>;
}

export default function App() {
  const isMobile = useMediaQuery('(max-width: 767px)');
  return isMobile ? <MobileApp /> : <DesktopApp />;
}
