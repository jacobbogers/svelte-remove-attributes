import { createFilter } from "@rollup/pluginutils";
import type { FilterPattern } from "@rollup/pluginutils";
import { generate } from "escodegen";
import type { Node as ESTreeNode } from 'estree';

import { parse, walk } from 'svelte/compiler';

import type {
  Processed as SvelteProcessed,
  Preprocessor as SveltePreprocessor,
  PreprocessorGroup,
} from 'svelte/types/compiler/preprocess';

import type { TemplateNode } from "svelte/types/compiler/interfaces";

export { PreprocessorGroup } from 'svelte/types/compiler/preprocess';

export interface RemoveAttributeOptions {
	attributes: string[];
	include?: FilterPattern;
	exclude?: FilterPattern;
	environments?: string[];
	debug?: boolean;
}
export function removeTestIdPreprocessor(options: RemoveAttributeOptions): PreprocessorGroup  {
	return {
			name: 'preprocess:remove-attributes',
			markup: ({ content, filename }) => {
				if (content.includes('data-testid')) {
					const ast = parse(content, { ...(filename && { filename }) });
					const slicers: {start: number, end: number}[] = [];
					// biome-ignore lint/suspicious/noExplicitAny: <explanation>
					walk(ast.html as any, {
						enter(node: ESTreeNode) {
							const n: TemplateNode = node as TemplateNode;
							if (n.type !== 'Attribute'){
								return;
							}
							if (options.attributes.includes(n.name)) {
								const { start, end } = n;
								slicers.push({ start, end });
							}
						}
					});
					// 
					slicers.reverse();

					for (const slice of slicers) {
						content = content.slice(0, slice.start) + content.slice(slice.end);
					}
					return { code: content };
				}
				return;
			}
		}