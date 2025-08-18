import { RuleConfigSeverity, type UserConfig } from "@commitlint/types";

const config: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    /* eslint-disable @typescript-eslint/naming-convention */
    "header-max-length": [RuleConfigSeverity.Error, "always", 72],
    "body-max-line-length": [RuleConfigSeverity.Error, "always", 72],
    /* eslint-enable @typescript-eslint/naming-convention */
  },
};

// eslint-disable-next-line import/no-default-export
export default config;
