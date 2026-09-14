import { writeFile } from "node:fs/promises";

import { AntiyachiviyConfigSchema } from "../src/app/config-schema.ts";

await writeFile(
  "config/antiyachiviy.schema.json",
  `${JSON.stringify(AntiyachiviyConfigSchema, null, 2)}\n`,
);
