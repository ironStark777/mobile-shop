import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import { reactRefresh } from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['dist', 'coverage']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      // Reglas estrictas que usan la información de tipos (promesas sin await, any inseguro...).
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      // Reglas de los hooks y del React Compiler (pureza, refs, setState durante el render...).
      reactHooks.configs.flat.recommended,
      // Los ficheros de componentes solo exportan componentes, para que la recarga en caliente funcione.
      reactRefresh.configs.vite(),
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: globals.node,
    },
  },
]);
