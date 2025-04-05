import { useEffect, useState, createContext, useContext, ReactNode, useCallback, useRef, useMemo } from "react";
import { photoshopPageStoreMap, photoshopStore } from "../logics/ModelDefines.mts";

// 创建Context
interface WebviewContextType {
  showWebviewDialog: () => void;
  setSrc: (src: string) => void;
  resetWebview: () => void

  webviewAgentSID: string
  prevWebviewAgentSID: string
  setWebviewAgentSID: (webviewAgentSID: string) => void
}

const WebviewContext = createContext<WebviewContextType | null>(null);

export function SDPPPWebviewProvider({ children }: { children: ReactNode }) {
  const webviewState = internalUseSDPPPWebview();
  useEffect(() => {
    window.addEventListener('message', (e) => {
      if (e.data.action !== "webview-connect") return;
      e.source?.postMessage({
        action: "webview-connect",
        payload: {
          webviewFromSid: photoshopStore.data.sid
        }
      })
    })
    let firstWebviewSID = ''
    photoshopPageStoreMap.subscribe('/', (sid, cur, prev) => {
      if (cur?.webviewFromSid == photoshopStore.data.sid) {
        webviewState.setWebviewAgentSID(cur?.sid)
        if (!firstWebviewSID) {
          firstWebviewSID = cur?.sid
        }
      }
      if (!cur && prev.webviewFromSid == photoshopStore.data.sid) {
        webviewState.setWebviewAgentSID(firstWebviewSID)
      }
    });
  }, [])

  return (
    <WebviewContext.Provider value={{
      webviewAgentSID: webviewState.webviewAgentSID,
      prevWebviewAgentSID: webviewState.prevWebviewAgentSID,
      setWebviewAgentSID: webviewState.setWebviewAgentSID,

      showWebviewDialog: webviewState.showWebviewDialog,
      setSrc: webviewState.setSrc,
      resetWebview: webviewState.resetWebview,
    }}>
      {children}
    </WebviewContext.Provider>
  );
}

// 自定义Hook用于访问Context
export function useSDPPPWebview() {
  const context = useContext(WebviewContext);
  if (!context) {
    throw new Error("useSDPPPWebview must be used within a SDPPPWebviewProvider");
  }
  return context;
}

// 原始Hook改为内部使用
function internalUseSDPPPWebview() {
  const [hiddenWebview, setHiddenWebview] = useState<HTMLWebViewElement | null>(null);
  const [dialogWebview, setDialogWebview] = useState<HTMLWebViewElement | null>(null);
  const [dialog, setDialog] = useState<HTMLDialogElement | null>(null);
  const [dialogShowing, setDialogShowing] = useState<boolean>(false);

  const [src, setSrc] = useState<string>("");
  const [webviewAgentSID, setWebviewAgentSID] = useState<string>('');
  const [prevWebviewAgentSID, setPrevWebviewAgentSID] = useState<string>('');
  const [lastLoadAfter5s, setLastLoadAfter5s] = useState<boolean>(false);
  const [lastLoadStopped, setLastLoadStopped] = useState<boolean>(false);
  const loadtimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const callback = () => {
      setDialogShowing(false);
      setWebviewAgentSID(prevWebviewAgentSID)
    }
    dialog?.addEventListener('close', callback)
    return () => {
      dialog?.removeEventListener('close', callback)
    }
  }, [dialog, prevWebviewAgentSID, setWebviewAgentSID, setDialogShowing]);

  useEffect(() => {
    setPrevWebviewAgentSID(webviewAgentSID)
  }, [webviewAgentSID])

  useEffect(() => {
    createDialog(setDialog, setDialogWebview)
    const createdHiddenWebview = createHiddenWebview()
    setHiddenWebview(createdHiddenWebview)

    if (loadtimeoutRef.current) {
      clearTimeout(loadtimeoutRef.current);
    }
    setLastLoadAfter5s(false);
    setLastLoadStopped(false);
    loadtimeoutRef.current = setTimeout(() => {
      setLastLoadAfter5s(true);
    }, 5000);
    createdHiddenWebview.addEventListener('loadstop', () => {
      setLastLoadStopped(true);
    })

    return () => {
      if (loadtimeoutRef.current) {
        clearTimeout(loadtimeoutRef.current);
      }
      dialog?.parentElement?.removeChild(dialog);
    }
  }, []);

  let [prevSettedSrc, setPrevSettedSrc] = useState<string>('');
  useEffect(() => {
    if (!src) return;
    setPrevSettedSrc(src);
    if (prevSettedSrc === src) {
      resetWebview();
    } else {
      hiddenWebview?.setAttribute('src', src);
      dialogWebview?.setAttribute('src', src);
    }
  }, [src]);

  const resetWebview = useCallback(() => {
    hiddenWebview?.parentElement?.removeChild(hiddenWebview);
    setDialogShowing(false);
    dialog?.close();
    const createdHiddenWebview = createHiddenWebview()
    setHiddenWebview(createdHiddenWebview)
    const currentSrc = src;
    setSrc('');
    setPrevSettedSrc('')
    setTimeout(() => {
      setSrc(currentSrc);
    }, 300)
  }, [hiddenWebview, src])

  const showWebviewDialog = useCallback(() => {
    dialog?.show();
    setDialogShowing(true);
  }, [dialog])

  

  return {
    dialogShowing,
    showWebviewDialog,
    setSrc,

    webviewAgentSID,
    setWebviewAgentSID,
    prevWebviewAgentSID,
    setPrevWebviewAgentSID,

    resetWebview,

    anyWebviewLoaded: lastLoadStopped,
    timeoutError: useMemo(() => {
      return lastLoadAfter5s && !lastLoadStopped
    }, [lastLoadAfter5s, lastLoadStopped]),
  }
}

function createDialog(
  setDialog: (dialog: HTMLDialogElement) => void,
  setDialogWebview: (webview: HTMLWebViewElement) => void
) {
  const dialog = document.createElement('dialog')
  dialog.className = 'sdppp-webview'
  dialog.style.padding = '0'
  dialog.style.margin = '0'
  dialog.style.width = '1024px'
  dialog.style.height = '768px'
  document.body.appendChild(dialog)
  setDialog(dialog)

  const webview = document.createElement('webview')
  webview.style.position = 'relative';
  webview.style.width = '1024px'
  webview.style.height = '768px'
  dialog.appendChild(webview)
  setDialogWebview(webview)

  return dialog
}

function createHiddenWebview() {
  const webview = document.createElement('webview')
  webview.style.position = 'absolute';
  webview.style.width = '50px'
  webview.style.height = '50px'
  webview.style.top = '-10000px'
  webview.style.left = '0'
  webview.style.opacity = '1'
  document.body.appendChild(webview)
  return webview
}
// webviewElement.addEventListener('loaderror', (e: any) => {
// });
// webviewElement.addEventListener('loadstop', () => {
//   // console.log('loadstop')
// });
// webviewElement.addEventListener('loadstart', () => {
//   // console.log('loadstart')
// });
