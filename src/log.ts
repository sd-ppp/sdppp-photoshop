import { sdpppX } from "../../../src/common/sdpppX.mjs";
import { debug } from "debug";
const logs: any[] = [];
sdpppX.getLogs = () => {
    return logs;
}
localStorage.setItem('debug', 'sdppp:*');
debug.log = (...args: any[]) => {
    logs.push(args.join(' '));
};
