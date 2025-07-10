export const bibleBooks = [
  { id: 1, title: '창세기', chapters: 50, category: '모세오경' },
  { id: 2, title: '출애굽기', chapters: 40, category: '모세오경' },
  { id: 3, title: '레위기', chapters: 27, category: '모세오경' },
  { id: 4, title: '민수기', chapters: 36, category: '모세오경' },
  { id: 5, title: '신명기', chapters: 34, category: '모세오경' },
  // ... (이하 생략, 카테고리별로 추가)
];

export const getBooksByCategory = (category: string) =>
  bibleBooks.filter(book => book.category === category); 