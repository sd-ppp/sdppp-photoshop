import { photoshopPageStoreMap, photoshopStore } from "../logics/ModelDefines.mts";
import { useSDPPPInternalContext } from "../contexts/sdppp-internal";
import { useSDPPPExternalContext } from "../contexts/sdppp-external";
import { useState, useEffect, useCallback } from "react";
import { useStore } from "../../../../src/common/store/store-hooks.mts";
import i18n from "../../../../src/common/i18n.mts";
import { sdpppX } from "../../../../src/common/sdpppX.mts";

function useFetchWorkflows(backendURL: string) {
    const { state: userData } = useStore(photoshopStore, ['/comfyUserToken'])
    const { socket, workflowAgentSID } = useSDPPPInternalContext();
    const [listData, setListData] = useState<{
        [path: string]: {
            path: string,
            content: any,
            error: string | ''
        }
    }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const listWorkflows = useCallback(async (agentSID?: string) => {
        if (!agentSID && !workflowAgentSID) {
            setListData({});
            return;
        }
        setIsLoading(true);
        const workflowAgent = photoshopPageStoreMap.getStore(agentSID || workflowAgentSID);
        try {
            const workflows = await socket?.listWorkflows(workflowAgent || null, {
                listMode: sdpppX.listMode,
                sdpppID: sdpppX.sdpppID,
                sdpppToken: localStorage.getItem('token') || ''
            }) || {
                workflows: [],
                error: 'Empty workflow list'
            };
            if ('error' in workflows) {
                setError(new Error(workflows.error));
                setIsLoading(false);
                return;
            }
            setIsLoading(false);
            setError(null);
            setListData(
                workflows.workflows
                    .reduce((acc: any, path: string) => {
                        acc[path] = { path: path, content: null, error: '' }
                        return acc
                    }, {})
            )
        } catch (e) {
            setIsLoading(false);
            setError(e as Error);
        }
    }, [socket, workflowAgentSID]);

    useEffect(() => {
        if (backendURL)
            listWorkflows()
    }, [backendURL]);

    useEffect(() => {
        if (userData?.comfyUserToken)
            listWorkflows();
    }, [userData])

    return {
        data: listData,
        isLoading,
        error,
        refetch: listWorkflows
    };
}


export function useSDPPPWorkflowList(): {
    workflows: {
        [path: string]: {
            path: string,
            content: any,
            error: string | ''
        }
    },
    isLoadingWorkflows: boolean,
    workflowsError: string,
    refetchWorkflows: () => void,
    afterPropsUpdate4s: boolean,
    currentViewingDirectory: string,
    setCurrentViewingDirectory: (currentViewingDirectory: string) => void,
    showingList: {
        path: string,
        isDir: boolean
    }[]
} {
    const { backendURL, comfyMultiUser } = useSDPPPInternalContext();
    const { workflowAgentSID } = useSDPPPExternalContext();
    const [afterPropsUpdate4s, setAfterPropsUpdate4s] = useState(true);
    const [currentViewingDirectory, setCurrentViewingDirectory] = useState('');
    // const {state: workflowAgentState} = useStore(workflowAgent as PageStore, ['/']);

    const { data: workflows, isLoading: isLoadingWorkflows, error: workflowsError, refetch: refetchWorkflows } = useFetchWorkflows(
        backendURL
    );

    useEffect(() => {
        if (workflowAgentSID) {
            refetchWorkflows();
            setAfterPropsUpdate4s(false)
        } else {
            setAfterPropsUpdate4s(true);
            const timeout = setTimeout(() => {
                setAfterPropsUpdate4s(false);
            }, 4000);
            return () => clearTimeout(timeout);
        }
    }, [workflowAgentSID]);

    let showingList: {
        path: string,
        isDir: boolean
    }[] = [];

    if (!isLoadingWorkflows && !workflowsError && workflows) {
        Object.keys(workflows).forEach((path) => {
            if (path.startsWith(currentViewingDirectory)) {
                const relativePath = path.slice(currentViewingDirectory.length).split('://').pop();

                if (!relativePath) {
                } else if (relativePath.indexOf('/') == -1) {
                    showingList.push({ path, isDir: false })
                } else {
                    showingList.unshift({ path: path.slice(0, path.lastIndexOf('/') + 1), isDir: true })
                }
            }
        })
        showingList = showingList.filter((item, index, self) =>
            self.findIndex((t) => t.path == item.path) === index);
    }


    let finalErrorMessage = '';
    if (workflowsError) {
        finalErrorMessage = workflowsError.message;
    }
    // if (!workflowAgentState.sid && !afterPropsUpdate4s)
    //     listReplacer = <sp-label class="list-error-label">{i18n('Webview initialize failed. Please report to me via Discord/Github with your ComfyURL, Operate System')}</sp-label>;

    if (!showingList.length)
        finalErrorMessage = i18n("Workflow list is empty, please save a workflow by Comfy's lastest UI");
    if (workflowsError)
        finalErrorMessage = i18n("Workflow list loading failed: {0}", workflowsError.message);
    if (isLoadingWorkflows)
        finalErrorMessage = "Loading";
    if (!workflowAgentSID)
        finalErrorMessage = i18n('Workflow Runner is loading...');

    return {
        workflows,
        isLoadingWorkflows,
        workflowsError: finalErrorMessage,
        refetchWorkflows,
        afterPropsUpdate4s,
        currentViewingDirectory,
        setCurrentViewingDirectory,
        // workflowAgentState,
        showingList
    }
}