import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// IMPORTANT for GitHub Pages: base must be "/<your-repo-name>/"
// e.g. if your repo is github.com/you/chitravela, keep it as '/chitravela/'.
// If you rename the repo, update this to match, or the deployed site
// will load with broken CSS/JS paths.
export default defineConfig({
  plugins: [react()],
  base: '/chitravela/'
});
