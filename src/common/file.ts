import path from 'path';

export function getTruncatedFileName(fileName: string) {
  const cwd = process.cwd();
  return fileName.includes(cwd)
    ? path.relative(process.cwd(), fileName)
    : fileName;
}
