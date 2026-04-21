export function listPlates(): Promise<string[]> {
  console.warn('[api stub] listPlates');
  return Promise.resolve([]);
}

export function replacePlates(plates: string[]): Promise<void> {
  console.warn('[api stub] replacePlates', plates);
  return Promise.resolve();
}
