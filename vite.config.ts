import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { readFileSync, writeFileSync } from 'fs';

// 自定义插件来处理 sdpppX.js 文件
function sdpppXPlugin() {
  const sdpppXPath = resolve(import.meta.dirname, './plugin/sdpppX.js');
  
  return {
    name: 'sdppp-x-plugin',
    configResolved(config) {
      const isDev = config.command === 'serve';
      
      try {
        let content = readFileSync(sdpppXPath, 'utf-8');
        
        if (isDev) {
          // 开发模式：添加 __CWURL__ 配置
          if (!content.includes('__CWURL__')) {
            content = content.replace(
              'global.sdpppX = {',
              `global.sdpppX = {
  __CWURL__: 'http://localhost:19920/content.html',`
            );
            writeFileSync(sdpppXPath, content, 'utf-8');
            console.log('✅ Added __CWURL__ to sdpppX.js for development');
          }
        } else {
          // 构建模式：移除 __CWURL__ 配置
          if (content.includes('__CWURL__')) {
            content = content.replace(/,\s*__CWURL__:\s*'[^']*'/g, '');
            content = content.replace(/__CWURL__:\s*'[^']*',?\s*/g, '');
            writeFileSync(sdpppXPath, content, 'utf-8');
            console.log('✅ Removed __CWURL__ from sdpppX.js for build');
          }
        }
      } catch (error) {
        console.error('❌ Error modifying sdpppX.js:', error);
      }
    }
  };
}

export default defineConfig({
  plugins: [react(), sdpppXPlugin()],
  resolve: {
  },
  base: './',
  build: {
    outDir: resolve(import.meta.dirname, './plugin/webview'),
    rollupOptions: {
      input: {
        content: resolve(import.meta.dirname, './content.html'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name][extname]',
      },
    },
  },
  server: {
    port: 19920,
  } 
}); 