import { writeFile } from "node:fs/promises";

import { YachigravityConfigSchema } from "../src/app/config-schema.ts";

await writeFile(
  "config/yachigravity.schema.json",
  `${JSON.stringify(YachigravityConfigSchema, null, 2)}\n`,
);
