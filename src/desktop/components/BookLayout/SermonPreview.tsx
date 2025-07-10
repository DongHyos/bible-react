import styles from './SermonPreview.module.css';
import type { SermonPreviewProps } from '../../../types/bible';

export default function SermonPreview({ book, chapter, verse, sermons, isLoading, error, onShowMore }: SermonPreviewProps) {

  if (isLoading) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>🎥 관련 설교 찾는 중...</h3>
        {[...Array(3)].map((_, index) => (
          <div key={index} className={styles.skeletonItem}>
            <div className={styles.skeletonThumbnail}></div>
            <div className={styles.skeletonText}>
              <div className={styles.skeletonLine}></div>
              <div className={`${styles.skeletonLine} ${styles.short}`}></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className={styles.container}><p className={styles.errorText}>설교 정보를 불러올 수 없습니다.</p></div>;
  }
  
  if (!sermons || sermons.length === 0) {
    return (
        <div className={styles.container}>
            <div className={styles.titleContainer}>
                <h3 className={styles.title}>{`"${book.name} ${chapter}:${verse}" 관련 설교`}</h3>
            </div>
            <p>관련 설교가 없습니다.</p>
        </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.titleContainer}>
        <h3 className={styles.title}>{`"${book.name} ${chapter}:${verse}" 관련 설교 (${sermons.length}개)`}</h3>
        {sermons && sermons.length > 0 && (
          <button onClick={onShowMore} className={styles.showMoreLink}>
            더 보기
          </button>
        )}
      </div>

      <ul className={
        `${styles.sermonList} ` +
        (sermons.slice(0, 3).length === 1
          ? styles.filled1
          : sermons.slice(0, 3).length === 2
          ? styles.filled2
          : styles.filled3)
      }>
        {sermons.slice(0, 3).map((sermon: import('../../../types/bible').Sermon) => (
          <li className={styles.sermonItem} key={sermon.id}>
          <a 
            href={sermon.youtubeUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.sermonLink}
          >
              <img src={sermon.thumbnailUrl || '/default-thumbnail.jpg'} alt={sermon.title} className={styles.sermonThumbnail} />
              <div className={styles.sermonInfo}>
                <p className={styles.sermonTitle} title={sermon.title}>{sermon.title}</p>
                <p className={styles.sermonMeta}>{sermon.pastorName}</p>
              </div>
            </a>
            </li>
        ))}
      </ul>
    </div>
  );
} 