import { assert } from "chai";
import { intToRGBA, Jimp } from "jimp";
import { action } from "photoshop";
import { storage } from "uxp";
import { runNextModalState } from "../../src/logics/modalStateWrapper.mts";

export async function openPSD(psdImport: Promise<any>, psdName = 'sdppp.psd') {
    const psdBuffer = (await psdImport).default;
    const psdBlob = new Blob([psdBuffer]);

    await runNextModalState(async () => {
        await _openPSD(psdBlob, psdName);
    }, {
        commandName: 'openPSD',
        document: null
    })
}
async function _openPSD(blob: Blob, psdName = 'sdppp.psd') {

    const buffer = await blob.arrayBuffer();

    const tempFolder = await storage.localFileSystem.getTemporaryFolder();
    let entry = await tempFolder.createEntry(psdName, { overwrite: true });
    await entry.write(buffer, { format: storage.formats.binary });
    let token = storage.localFileSystem.createSessionToken(entry);

    await action.batchPlay(
        [
            {
                "_obj": "open",
                "as": {
                    "_obj": "photoshop35Format",
                    "maximizeCompatibility": true
                },
                "documentID": 189,
                "null": {
                    "_kind": "local",
                    "_path": token
                },
                "template": false
            }
        ],
        { 
            synchronousExecution: true
        })

}

export async function compareImageBlobAndPng(buffer: Uint8Array, pngBuffer: Uint8Array, allowedDiff: number = 15) {
    const png = await Jimp.fromBuffer(Buffer.from(pngBuffer))

    assert.equal(png.bitmap.width * png.bitmap.height, buffer.length / 4)
    for (let w = 0; w < png.bitmap.width; w++) {
        for (let h = 0; h < png.bitmap.height; h++) {
            const rgba = intToRGBA(png.getPixelColor(w, h))
            const index = (h * png.bitmap.width + w) * 4
            const message = `pixel compare failed w${w}, h${h} with ${JSON.stringify(rgba)} and ${buffer.slice(index, index + 4)}`
            // png will carry rgb even rgba.a is 0, but I think it should be all 0
            if (rgba.a == 0) {
                assert(buffer[index] == 0, message);
                assert(buffer[index + 1] == 0, message);
                assert(buffer[index + 2] == 0, message);
                assert(buffer[index + 3] == 0, message);

            } else {
                assert(Math.abs(rgba.r - buffer[index]) < allowedDiff, message);
                assert(Math.abs(rgba.g - buffer[index + 1]) < allowedDiff, message);
                assert(Math.abs(rgba.b - buffer[index + 2]) < allowedDiff, message);
                assert(Math.abs(rgba.a - buffer[index + 3]) < allowedDiff, message);
            }
        }
    }
}