import { convert } from 'html-to-text';

// Truncate a string to a max length, removing HTML tags and not cutting words
export const truncate = (str: string, maxLength: number): string => {
  if (!str) return '';
  // Remove HTML tags
  const plain = convert(str, {
    wordwrap: false,
  });

  if (plain.length <= maxLength) {
    return plain;
  }
  // Truncate without cutting words
  let truncated = plain.slice(0, maxLength);
  // If the last character is not a space, backtrack to last space
  if (plain[maxLength] && !/\s/.test(plain[maxLength])) {
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > 0) {
      truncated = truncated.slice(0, lastSpace);
    }
  }
  return truncated + '…';
};
