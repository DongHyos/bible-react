import { useState } from 'react';
export function useBookOpen() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleBook = () => setIsOpen(open => !open);
  return { isOpen, toggleBook };
} 