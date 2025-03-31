import { photoshopStore } from "../logics/ModelDefines.mts";
import { useQuery } from "@tanstack/react-query";
import { ComfyApis } from "../logics/apis.mts";
import { useSDPPPInternalContext } from "../contexts/sdppp-internal";
import { useSDPPPExternalContext } from "../contexts/sdppp-external";
import { useState, useEffect } from "react";
import { useStore } from "../../../src/common/store/store-hooks.mts";
import i18n from "../../../src/common/i18n.mts";
import { PageStore } from "../../../src/sdsystem/common/store/page.mts";

function useFetchWorkflows(backendURL: string, comfyMultiUser: boolean, workflowagent: PageStore) {
    const { state: userData } = useStore(photoshopStore, ['/comfyUserToken'])
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['workflows', backendURL],
        queryFn: async () => {
            if (comfyMultiUser && !workflowagent.data.comfyUserToken) {
                const error = new Error(i18n('--multi-user activated, Not Login!'))
                error.name = 'NotLoginError'
                throw error
            }
            const workflows = await ComfyApis.fetchWorkflows(backendURL, workflowagent.data.comfyUserToken);
            return workflows.reduce((acc: any, path: string) => {
                acc[path] = { path: path, content: null, error: '' }
                return acc
            }, {})
        },
        retry: (failureCount, error) => {
            // Don't retry for authentication errors (multi-user not logged in)
            if (error instanceof Error && error.name === 'NotLoginError') {
                return false;
            }
            // Default retry behavior for other errors (3 times)
            return failureCount < 3;
        },
        staleTime: 5000,
    });
    useEffect(() => {
        if (userData?.comfyUserToken) {
            refetch();
        }
    }, [userData])

    return {
        data: data as {
            [path: string]: {
                path: string,
                content: any,
                error: string | ''
            }
        },
        isLoading,
        error,
        refetch
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
    const { backendURL, comfyMultiUser, workflowAgent } = useSDPPPInternalContext();
    const { workflowAgentSID } = useSDPPPExternalContext();
    const [afterPropsUpdate4s, setAfterPropsUpdate4s] = useState(true);
    const [currentViewingDirectory, setCurrentViewingDirectory] = useState('');
    // const {state: workflowAgentState} = useStore(workflowAgent as PageStore, ['/']);

    const { data: workflows, isLoading: isLoadingWorkflows, error: workflowsError, refetch: refetchWorkflows } = useFetchWorkflows(
        backendURL, comfyMultiUser, workflowAgent as PageStore
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
                const relativePath = path.slice(currentViewingDirectory.length);
                if (relativePath.indexOf('/') == -1) {
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
    if (workflowsError)
        finalErrorMessage = i18n("Workflow list loading failed: {0}", workflowsError.message);
    if (!showingList.length)
        finalErrorMessage = i18n("Workflow list is empty, please save a workflow by Comfy's lastest UI");
    if (!(globalThis as any).sdppp.MU && comfyMultiUser)
        finalErrorMessage = i18n('Workflow List of ComfyUI with --multi-user is only available for sponsors');
    if (isLoadingWorkflows)
        finalErrorMessage = "Loading";

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