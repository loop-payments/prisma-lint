import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

// Supported config file paths, in priority order
// See: https://www.prisma.io/docs/orm/reference/prisma-config-reference
const PRISMA_CONFIG_PATHS = [
  // Root-level config files (recommended for small projects)
  'prisma.config.ts',
  'prisma.config.mts',
  'prisma.config.cts',
  'prisma.config.js',
  'prisma.config.mjs',
  'prisma.config.cjs',
  // .config directory (recommended for larger projects)
  // See: https://github.com/pi0/config-dir
  '.config/prisma.ts',
  '.config/prisma.mts',
  '.config/prisma.cts',
  '.config/prisma.js',
  '.config/prisma.mjs',
  '.config/prisma.cjs',
];

export type PrismaConfig = {
  schema?: string;
};

type LoadedPrismaConfig = {
  config: PrismaConfig;
  filepath: string;
};

/**
 * Searches for a Prisma config file starting from the given directory
 * and walking up the directory tree.
 *
 * Supports both root-level configs (prisma.config.ts) and .config directory
 * configs (.config/prisma.ts) as recommended by Prisma documentation.
 */
export const findPrismaConfigFile = (startDir: string): string | null => {
  let currentDir = startDir;

  while (true) {
    for (const configRelativePath of PRISMA_CONFIG_PATHS) {
      const configPath = path.join(currentDir, configRelativePath);
      if (fs.existsSync(configPath)) {
        return configPath;
      }
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      // Reached root directory
      return null;
    }
    currentDir = parentDir;
  }
};

/**
 * Loads and parses a prisma.config.ts/js file.
 * Returns the config object and filepath, or null if not found.
 */
export const loadPrismaConfig = async (
  startDir: string,
): Promise<LoadedPrismaConfig | null> => {
  const configPath = findPrismaConfigFile(startDir);
  if (configPath == null) {
    return null;
  }

  try {
    // Use dynamic import to load the config file
    // This works for both .ts (with tsx/ts-node) and .js/.mjs files
    const fileUrl = pathToFileURL(configPath).href;
    const module = (await import(fileUrl)) as {
      default?: { schema?: string } | (() => { schema?: string });
    };

    // Handle both default export and named export patterns
    const exported = module.default;
    if (exported == null) {
      return null;
    }

    // Prisma config can be a function (defineConfig pattern) or plain object
    const config = typeof exported === 'function' ? exported() : exported;

    return {
      config: {
        schema: normalizeSchemaPath(config.schema, configPath),
      },
      filepath: configPath,
    };
  } catch {
    // Config file exists but couldn't be loaded (e.g., TypeScript not available)
    // This is expected in some environments - silently return null
    return null;
  }
};

/**
 * Normalizes the schema path from prisma.config.ts to be relative to cwd.
 * The schema path in prisma.config.ts is relative to the config file location.
 */
const normalizeSchemaPath = (
  schemaPath: string | undefined,
  configPath: string,
): string | undefined => {
  if (schemaPath == null) {
    return undefined;
  }

  // If it's an absolute path, use it as-is
  if (path.isAbsolute(schemaPath)) {
    return schemaPath;
  }

  // Make the path relative to the config file's directory
  const configDir = path.dirname(configPath);
  return path.join(configDir, schemaPath);
};

/**
 * Gets the schema path from prisma.config.ts if available.
 * Returns null if no config file found or no schema path specified.
 */
export const getSchemaPathFromPrismaConfig = async (
  startDir: string,
): Promise<string | null> => {
  const result = await loadPrismaConfig(startDir);
  return result?.config.schema ?? null;
};
