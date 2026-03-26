import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import type { StorageAdapter } from "./types";

export class LocalStorage implements StorageAdapter {
  private basePath: string;

  constructor(basePath: string) {
    this.basePath = basePath;
  }

  async save(fileName: string, buffer: Buffer): Promise<string> {
    // Create date-based subdirectory
    const now = new Date();
    const dateDir = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}`;
    const dir = path.join(this.basePath, dateDir);
    await fs.mkdir(dir, { recursive: true });

    // Generate unique filename
    const ext = path.extname(fileName);
    const uniqueName = `${uuidv4()}${ext}`;
    const filePath = path.join(dateDir, uniqueName);
    const fullPath = path.join(this.basePath, filePath);

    await fs.writeFile(fullPath, buffer);
    return filePath;
  }

  async read(filePath: string): Promise<Buffer> {
    const fullPath = path.join(this.basePath, filePath);
    return fs.readFile(fullPath);
  }

  async delete(filePath: string): Promise<void> {
    const fullPath = path.join(this.basePath, filePath);
    await fs.unlink(fullPath);
  }
}
