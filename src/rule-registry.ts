import singularModelName from "./rules/singular-model-name.js";
import dbPrefixedModelName from "./rules/db-prefixed-model-name.js";
import tenantQid from "./rules/tenant-qid.js";
import type { RuleRegistry } from "./util.js";

// TODO: use prisma-lint.json for this.
export default {
  "db-prefixed-model-name": dbPrefixedModelName,
  "singular-model-name": singularModelName,
  "tenant-qid": tenantQid,
} satisfies RuleRegistry;
