interface Window {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  gtag: (...args: any[]) => void;
  dataLayer: Record<string, unknown>[];
}
