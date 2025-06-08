import { useEffect, useState, createContext, useContext, ReactNode, useCallback, useRef, useMemo } from "react";
import { photoshopPageStoreMap, photoshopStore } from "../logics/ModelDefines.mts";

// 创建Context
interface WebviewContextType {
  toggleWebviewDialog: () => void;
  setSrc: (src: string) => void;
  resetWebview: () => void

  webviewAgentSID: string
  prevWebviewAgentSID: string
  setWebviewAgentSID: (webviewAgentSID: string) => void

  timeoutError: boolean
  loadError: string
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

      toggleWebviewDialog: webviewState.toggleWebviewDialog,
      setSrc: webviewState.setSrc,
      resetWebview: webviewState.resetWebview,

      timeoutError: webviewState.timeoutError,
      loadError: webviewState.loadError,
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
  const [loadError, setLoadError] = useState<string>('');

  useEffect(() => {
    const callback = () => {
      setDialogShowing(false);
      setWebviewAgentSID(prevWebviewAgentSID)
      resetWebview(); // actually it just need to reload the workflow, think about better solution later
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
    createdHiddenWebview.addEventListener('loaderror', (e) => {
      setLoadError((e as any).message || e.type);
    })
    createdHiddenWebview.addEventListener('loadstart', () => {
      setLoadError('');
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

  const toggleWebviewDialog = useCallback(() => {
    if (dialogShowing) {
      dialog?.close();
      setDialogShowing(false);
    } else {
      dialog?.show();
      setDialogShowing(true);
    }
  }, [dialog, dialogShowing])

  

  return {
    dialogShowing,
    toggleWebviewDialog,
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
    loadError, 
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

let webviewContainer: HTMLDivElement | null = null
function createHiddenWebview() {
  if (!webviewContainer) {
    webviewContainer = document.createElement('div')
    webviewContainer.style.position = 'absolute';
    webviewContainer.style.width = '100px'
    webviewContainer.style.height = '100px'
    webviewContainer.style.right = '0'
    webviewContainer.style.bottom = '-10000px'
    document.body.appendChild(webviewContainer)
  }
  const webview = document.createElement('webview')
  webview.style.width = '100px'
  webview.style.height = '100px'
  webviewContainer?.appendChild(webview)
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
