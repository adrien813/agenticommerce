import {copyFileSync} from 'node:fs';
copyFileSync(new URL('./node_modules/three/build/three.module.min.js',import.meta.url),new URL('./dist/three.js',import.meta.url));
console.log('Néolias II: static assets ready.');
