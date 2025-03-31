import { commonConfig, isProduction, projectRoot, SDPPPTestResolvePlugin } from "../../src/build/lib.esbuild.ts"
import { dirname, join } from "path"
import externalGlobalPlugin from "esbuild-plugin-external-global";
import { fileURLToPath } from "url";
import esbuild from "esbuild";
import JavaScriptObfuscator from 'javascript-obfuscator'
import type { Format, Loader } from "esbuild";
import { writeFileSync } from "fs";
const __dirname = dirname(fileURLToPath(import.meta.url))

const photoshopInternalConfig = {
    ...commonConfig,
    format: 'iife' as Format,
    entryPoints: {
        'photoshop-internal': join(__dirname, '../src/global.mts')
    },
    outdir: join(projectRoot, 'plugins/photoshop/dist'),
    external: ['uxp', 'photoshop', 'os', 'fs', 'react', 'react-dom/client', 'jimp', 'socket.io-client', 'react/jsx-runtime', 'buffer'],
    plugins: [
        externalGlobalPlugin.externalGlobalPlugin({
            'react': 'window.React',
            'react/jsx-runtime': 'window.ReactJSXRuntime',
            'react-dom/client': 'window.ReactDOMClient',
            'jimp': 'window.Jimp',
            'socket.io-client': 'window.socketIO',
            'buffer': 'window.Buffer'
        }),
        SDPPPTestResolvePlugin
    ],
    sourcemap: false,
    minify: isProduction,
    write: false,
    loader: {
        '.psd': 'binary' as Loader,
        '.png': 'binary' as Loader
    }
}

export function buildPhotoshopInternal() {
    return esbuild.build(photoshopInternalConfig)
        .then((result) => {
            result.outputFiles?.forEach(outputFile => {
                let content = outputFile.text
                if (isProduction) {
                    const obfuscationResult = JavaScriptObfuscator.obfuscate(outputFile.text, {
                        rotateStringArray: true
                    })
                    content = obfuscationResult.getObfuscatedCode()
                }

                writeFileSync(outputFile.path, content)
            })
        })
}