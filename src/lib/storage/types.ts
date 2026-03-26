export interface StorageAdapter {
  save(fileName: string, buffer: Buffer): Promise<string>;
  read(filePath: string): Promise<Buffer>;
  delete(filePath: string): Promise<void>;
}
