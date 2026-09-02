/**
 * Based on the discussion at https://github.com/expressive-code/expressive-code/issues/153#issuecomment-2282218684
 */
import { definePlugin } from "@expressive-code/core";

export function pluginLanguageBadge() {
	return definePlugin({
		name: "Language Badge",
		baseStyles: () => `
      [data-language]::before {
        position: absolute;
        z-index: 2;
        right: var(--space-xs);
        top: var(--space-xs);
        padding: var(--space-3xs) var(--space-xs);
        content: attr(data-language);
        font-family: var(--font-mono);
        font-size: var(--text-xs);
        font-weight: bold;
        text-transform: uppercase;
        color: var(--color-paper-3);
        background: var(--color-ink-2);
        border-radius: var(--radius-sm);
        pointer-events: none;
        opacity: 0;
      }
      .frame:not(.has-title):not(.is-terminal) {
        @media (hover: none) {
          & [data-language]::before {
            opacity: 1;
            margin-right: calc(var(--control-min) + var(--space-xs));
          }
          & [data-language]:active::before {
            opacity: 0;
          }
        }
        @media (hover: hover) {
          & [data-language]::before {
            opacity: 1;
          }
          &:hover [data-language]::before {
            opacity: 0;
          }
        }
      }
    `,
	});
}
