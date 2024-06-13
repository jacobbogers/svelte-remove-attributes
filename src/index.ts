import { createFilter } from '@rollup/pluginutils';
import type { FilterPattern } from '@rollup/pluginutils';
import type { Node as ESTreeNode } from 'estree-walker';
import MagicString from 'magic-string';

import { parse, walk } from 'svelte/compiler';

import type { PreprocessorGroup, Processed } from 'svelte/types/compiler/preprocess';

import type { TemplateNode } from 'svelte/types/compiler/interfaces';

export { PreprocessorGroup } from 'svelte/types/compiler/preprocess';

export type RemoveAttributeOptions = Partial<{
    attributes: string[];
    include: FilterPattern;
    exclude: FilterPattern;
    environments: string[];
    debug: boolean;
}>;

function defaultOptions(raw?: RemoveAttributeOptions): Required<RemoveAttributeOptions> {
    const o: RemoveAttributeOptions = raw ?? {};
    if (!o.attributes || o.attributes.length === 0) {
        o.attributes = ['data-testid'];
    }
    if (!o.include) {
        o.include = [/\.svelte$/];
    }
    if (!o.exclude) {
        o.exclude = ['**/node_modules/**'];
    }
    if (!o.environments || o.environments.length === 0) {
        o.environments = ['production'];
    }
    if (o.debug === undefined) {
        o.debug = false;
    }
    return o as Required<RemoveAttributeOptions>;
}
// { include = [/\.[tj]sx$/], exclude = ["**/node_modules/**"], attributes, usage = "rollup", environments = ["production"], debug = false, }
export function removeTestIdPreprocessor(o?: RemoveAttributeOptions): false | PreprocessorGroup {
    const finalOptions = defaultOptions(o);

    const { include, exclude, environments, debug, attributes } = finalOptions;

    const filterValidFile = createFilter(include, exclude);
    const plName = 'preprocess:remove-attributes';
    const node_env_lowercase = process.env.NODE_ENV?.toLowerCase() || '';
    if (!node_env_lowercase) {
        console.warn(`[${plName}] NODE_ENV was not set on in this build, this plugin will not run`);
        return false;
    }
    if (!Array.isArray(environments)) {
        console.error(`[${plName}] "environments" plugin option is not an array`);
        return false;
    }
    if (environments.length === 0) {
        console.error(`[${plName}] "environments" plugin option is an array of zero length`);
        return false;
    }
    if (environments.filter((e) => typeof e === 'string').length !== environments.length) {
        console.error(`[${plName}] "environments" plugin options must contain strings`);
        return false;
    }
    if (environments.filter((e) => e.trim() !== '').length !== environments.length) {
        console.error(`[${plName}] "environments" plugin options must contain non zero length strings`);
        return false;
    }
    if (!environments.includes(node_env_lowercase)) {
        if (debug) {
            const envs = environments.map((e) => `"${e}"`).join(',');
            console.error(
                `[${plName}] The current environemnt: "${node_env_lowercase}", the plugin is configured to run in: ${envs}`
            );
        }
        return false;
    }

    return {
        name: plName,
        markup(o: { content: string; filename?: string }): Processed | undefined {
            const { content, filename } = o;
            if (!filterValidFile(filename)) {
                return;
            }
            const ms = new MagicString(content);
            if (attributes.find((attr) => content.includes(attr))) {
                const ast = parse(content, { ...(filename && { filename }) });

                walk(ast.html as ESTreeNode, {
                    enter(node: ESTreeNode) {
                        const n: TemplateNode = node as TemplateNode;
                        if (n.type !== 'Attribute') {
                            return;
                        }
                        if (attributes.includes(n.name)) {
                            const { start, end } = n;
                            ms.remove(start, end);
                        }
                    }
                });
                const code = ms.toString();
                const map =
                    filename &&
                    ms.generateMap({
                        source: filename,
                        hires: true
                    });
                return { code, ...(map && { map }) };
            }
        }
    };
}
