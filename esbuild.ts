import { commonConfig, isProduction, projectRoot, SDPPPTestResolvePlugin, typescriptSrcRoot } from "../../_build/lib.ts"
import { dirname, join } from "path"
import externalGlobalPlugin from "esbuild-plugin-external-global";
import { fileURLToPath } from "url";
import JavaScriptObfuscator from 'javascript-obfuscator'
import { writeFileSync, readFileSync } from "fs";
import { createRequire } from "module";
const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

export const config = {
    ...commonConfig,
    tsconfig: join(__dirname, './tsconfig.json'),
    format: 'iife',
    entryPoints: {
        'photoshop-internal': join(__dirname, './src/global.mts')
    },
    outdir: join(projectRoot, 'plugins/photoshop/dist'),
    external: ['uxp', 'photoshop', 'os', 'fs', 'react', 'react-dom/client', 'jimp', 'socket.io-client', 'react/jsx-runtime'],
    define: {
        'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development')
    },
    plugins: [
        {
            name: 'crypto-browserify-resolver',
            setup(build: any) {
                build.onResolve({ filter: /^crypto$/ }, (args: any) => {
                    return {
                        path: require.resolve('crypto-browserify')
                    }
                })
                build.onResolve({ filter: /^buffer$/ }, (args: any) => {
                    return {
                        path: require.resolve('buffer/')
                    }
                })
                build.onResolve({ filter: /^events$/ }, (args: any) => {
                    return {
                        path: require.resolve('events/')
                    }
                })
                build.onResolve({ filter: /^util$/ }, (args: any) => {
                    return {
                        path: require.resolve('util/')
                    }
                })
                build.onResolve({ filter: /^stream$/ }, (args: any) => {
                    return {
                        path: require.resolve('stream-browserify')
                    }
                })
            }
        },
        externalGlobalPlugin.externalGlobalPlugin({
            'react': 'window.React',
            'react/jsx-runtime': 'window.ReactJSXRuntime',
            'react-dom/client': 'window.ReactDOMClient',
            'jimp': 'window.Jimp',
            'socket.io-client': 'window.socketIO',
            'util': 'window.util',
            'assert': 'window.assert',
            'events': 'window.events'
        }),
        SDPPPTestResolvePlugin(join(typescriptSrcRoot, './modules/photoshop-internal/test/entry.mts')),
        {
            name: 'license-and-obfuscate',
            setup(build: any) {
                if (!isProduction) return;
                build.onEnd((result: any) => {
                    // 读取LICENSE文件
                    const licensePath = join(projectRoot, 'LICENSE');
                    const licenseContent = readFileSync(licensePath, 'utf-8');
                    const licenseHeader = `/* @LICENSE
${licenseContent}*/
`;
                    result.outputFiles?.forEach((outputFile: any) => {
                        if (!outputFile.path.endsWith('.js')) return;
                        
                        let content = outputFile.text;
                        if (isProduction) {
                            const obfuscationResult = JavaScriptObfuscator.obfuscate(content, {
                                rotateStringArray: true
                            });
                            content = obfuscationResult.getObfuscatedCode();
                        }
                        
                        // 添加开源许可声明到文件顶部
                        content = licenseHeader + content;
                        outputFile.contents = Buffer.from(content);
                    });
                });
            }
        }
    ],
    sourcemap: false,
    minify: isProduction,
    loader: {
        '.psd': 'binary',
        '.png': 'binary'
    }
}