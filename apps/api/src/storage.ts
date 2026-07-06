import { mkdirSync, writeFileSync } from "node:fs";
import { basename, extname, join, normalize } from "node:path";
import { randomUUID } from "node:crypto";

export interface LocalStorageConfig {
  dataDir: string;
}

export interface StoredFileMetadata {
  relativePath: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
}

export function ensureStorage(config: LocalStorageConfig) {
  mkdirSync(join(config.dataDir, "assets"), { recursive: true });
  mkdirSync(join(config.dataDir, "exports"), { recursive: true });
}

export function saveAssetFile(
  config: LocalStorageConfig,
  input: { buffer: Buffer; originalName: string; mimeType: string }
): StoredFileMetadata {
  ensureStorage(config);

  const extension = extname(input.originalName).toLowerCase();
  const fileName = `${randomUUID()}${extension}`;
  const relativePath = normalize(join("assets", fileName));
  writeFileSync(join(config.dataDir, relativePath), input.buffer);

  return {
    relativePath,
    originalName: basename(input.originalName),
    mimeType: input.mimeType,
    sizeBytes: input.buffer.byteLength
  };
}
