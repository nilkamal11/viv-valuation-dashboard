import { sites } from '@openai/sites-vite-plugin';
import tailwindcss from '@tailwindcss/postcss';
import vinext from 'vinext';
import { defineConfig } from 'vite';

// The statement dashboard is a static export with no server or database bindings.
export default defineConfig({
 css:{postcss:{plugins:[tailwindcss()]}},
 plugins:[vinext(),sites()],
});
