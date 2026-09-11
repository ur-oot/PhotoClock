/**
 * LocalStorage 安全アクセスユーティリティ
 * ブラウザのプライベートブラウズやクォータ超過時にも安全に読み書き・削除を行う。
 */

export function getSafeStorageItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function setSafeStorageItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // quota exceeded や SecurityError 等の例外を安全に握る
  }
}

export function removeSafeStorageItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}
