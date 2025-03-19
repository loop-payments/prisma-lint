import { z } from 'zod';

import rules from '#src/rule-definitions.js';

// Create a schema for the entire config
export const configSchema = z.object({
  rules: z
    .object(
      Object.fromEntries(
        Object.entries(rules).map(([name, rule]) => [
          name,
          rule.configSchema.optional(),
        ]),
      ),
    )
    .optional(),
});

// Export the inferred type
export type Config = z.infer<typeof configSchema>;

/**
 * Helper function to provide type safety when creating configuration
 * @param config The configuration object
 * @returns The validated configuration object
 * @throws {ZodError} If the configuration is invalid
 */
export function defineConfig(config: Config): Config {
  return configSchema.parse(config);
}
