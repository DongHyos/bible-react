import { useState } from 'react';
import styles from './SermonModal.module.css';
import type { SermonModalProps, Sermon } from '../../../types/bible';

// 유튜브 URL을 임베드용 URL로 변환하는 헬퍼 함수
const getEmbedUrl = (url: string) => {
  try {
    const videoId = new URL(url).searchParams.get('v');
    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  } catch (error) {
    console.error('Invalid YouTube URL:', url);
    return '';
  }
};

const SermonDetail = ({ sermon }: { sermon: Sermon }) => (
  <div className={styles.detailContent}>
    {sermon.youtubeUrl && (
      <div className={styles.videoWrapper}>
        <iframe
          src={getEmbedUrl(sermon.youtubeUrl)}
          title={sermon.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    )}
    {sermon.tags && (
      <div className={styles.tags}>
        {sermon.tags.map((tag: string) => (
          <span key={tag} className={styles.tag}>#{tag}</span>
        ))}
      </div>
    )}
    {/* 설교 전문이 있다면 여기에 표시하는 로직 추가 가능 */}
  </div>
);

export default function SermonModal({ sermons, onClose }: SermonModalProps) {
  const [expandedSermonId, setExpandedSermonId] = useState<number | null>(sermons.length > 0 ? sermons[0].id : null);

  const handleToggle = (sermonId: number) => {
    setExpandedSermonId(prevId => (prevId === sermonId ? null : sermonId));
  };

  // 배경 클릭 시 모달 닫기
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>&times;</button>
        <h2 className={styles.modalTitle}>관련 설교 목록</h2>
        <div className={styles.sermonListContainer}>
          {sermons.map(sermon => (
            <div key={sermon.id} className={styles.sermonItem}>
              <div className={styles.sermonHeader} onClick={() => handleToggle(sermon.id)}>
                <div>
                  <h3 className={styles.sermonTitle}>{sermon.title}</h3>
                  <p className={styles.sermonMeta}>
                    {sermon.pastorName} · {sermon.churchName} ({sermon.sermonDate})
                  </p>
                </div>
                <span className={`${styles.toggleIcon} ${expandedSermonId === sermon.id ? styles.expanded : ''}`}>
                  ▼
                </span>
              </div>
              {expandedSermonId === sermon.id && <SermonDetail sermon={sermon} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 