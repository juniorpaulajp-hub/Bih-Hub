18:06:44.776 Running build in Portland, USA (West) – pdx1
18:06:44.777 Build machine configuration: 2 cores, 8 GB
18:06:44.907 Cloning github.com/juniorpaulajp-hub/Bih-Hub (Branch: main, Commit: 9f8116d)
18:06:45.399 Cloning completed: 492.000ms
18:06:45.477 Restored build cache from previous deployment (4Ug3KR91rP3HHLEBvNyHCQARMA3q)
18:06:45.764 Running "vercel build"
18:06:46.426 Vercel CLI 50.28.0
18:06:46.982 Installing dependencies...
18:06:48.972 
18:06:48.974 up to date in 2s
18:06:48.974 
18:06:48.975 7 packages are looking for funding
18:06:48.975   run `npm fund` for details
18:06:49.006 Running "npm run build"
18:06:49.102 
18:06:49.102 > bih-hub@1.0.0 build
18:06:49.103 > vite build
18:06:49.103 
18:06:49.424 [36mvite v4.5.14 [32mbuilding for production...[36m[39m
18:06:49.454 transforming...
18:06:49.885 [32m✓[39m 17 modules transformed.
18:06:49.887 [32m✓ built in 461ms[39m
18:06:49.887 [31mUnexpected token[39m
18:06:49.888 file: [36m/vercel/path0/bih-hub/src/storage.js:42:38[39m
18:06:49.888 [33m40: ```
18:06:49.888 41: 
18:06:49.888 42: Depois no Vercel, coloque o valor da `VITE_JSONBIN_KEY` **entre aspas duplas** assim:
18:06:49.888                                           ^
18:06:49.889 43: ```
18:06:49.889 44: "$2a$10$NLRkfzqsKX7gVXWjDvvBT.cK0Pk4DKX2gl/wi9O2yQqJ/nyWhzqQ."[39m
18:06:49.892 [31merror during build:
18:06:49.892 RollupError: Unexpected token
18:06:49.892     at error (file:///vercel/path0/bih-hub/node_modules/rollup/dist/es/shared/node-entry.js:2287:30)
18:06:49.893     at Module.error (file:///vercel/path0/bih-hub/node_modules/rollup/dist/es/shared/node-entry.js:13751:16)
18:06:49.893     at Module.tryParse (file:///vercel/path0/bih-hub/node_modules/rollup/dist/es/shared/node-entry.js:14482:25)
18:06:49.893     at Module.setSource (file:///vercel/path0/bih-hub/node_modules/rollup/dist/es/shared/node-entry.js:14083:39)
18:06:49.893     at ModuleLoader.addModuleSource (file:///vercel/path0/bih-hub/node_modules/rollup/dist/es/shared/node-entry.js:24678:20)[39m
18:06:49.912 Error: Command "npm run build" exited with 1
