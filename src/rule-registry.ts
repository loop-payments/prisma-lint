import singularModelName from "#src/rules/singular-model-name.js";
import dbPrefixedModelName from "#src/rules/db-prefixed-model-name.js";
import tenantQid from "#src/rules/tenant-qid.js";
import type { RuleRegistry } from "#src/util.js";

// TODO: use prisma-lint.json for this.
export default {
  "db-prefixed-model-name": dbPrefixedModelName,
  "singular-model-name": singularModelName,
  "tenant-qid": tenantQid,
} satisfies RuleRegistry;
