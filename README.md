# svelte-remove-attributes

Svelte & Sveltekit preprocessor to remove attributes (like `data-testid`).

The initial motivation was to remove `data-testid` attributes from production build.

It can be generally used to remove any number of attributes.

The preprocessor only runs when `NODE_ENV` matches the values of the `environments` option (default is `['production']`).

## Installation

```bash

npm i -D svelte-remove-attributes
```

## Usage with Svelte & SvelteKit

Adjust your `svelte.config.js`

Example:

```typescript
//file: svelte.config.js
import nodeAdapter from '@sveltejs/adapter-node';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import removeTestIdPreprocessor from 'svelte-remove-attributes';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://kit.svelte.dev/docs/integrations#preprocessors
    // for more information about preprocessors
    preprocess: [
        vitePreprocess({}),

        // example 1: Use without an option object, will revert to defaults
        removeTestIdPreprocessor(),

        // example 2: Selective options..
        removeTestIdPreprocessor({
            // (optional) array of attributes will be removed, default ['data-testid'].
            attributes: ['data-testid'],

            // (optional) show trace information when running this preprocessor, default false.
            debug: false,

            // (optional) array of environments to run this processor, default ['production'].
            environments: ['production'],

            // (optional) array of minimax file patterns this preprocessor will exclude, default ['**/node_modules/**'].
            exclude: ['**/node_modules/**'],

            // (optional) array of minimax file patterns of files that will be processed, default [/\.svelte$/].
            include: [/\.svelte$/]
        })
    ]
    // rest of the config
};
```

## Options Object

-   `attributes`: an array of attributes will be removed, default `['data-testid']`.
-   `debug`: show trace information when running this preprocessor, default `false`.
-   `environments`: array of environments to run this processor, default `['production']`.
-   `exclude`: array of minimax file patterns this preprocessor will exclude, default `['**/node_modules/**']`.
-   `include`: array of minimax file patterns of files that will be processed, default `[/\.svelte$/]`.
