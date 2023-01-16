import singularModelName from "src/rules/singular-model-name.js";
import dbPrefixedModelName from "src/rules/db-prefixed-model-name.js";

// TODO: use prisma-lint.json for this.
export default {
  "db-prefixed-model-name": dbPrefixedModelName,
  "singular-model-name": singularModelName,
};
