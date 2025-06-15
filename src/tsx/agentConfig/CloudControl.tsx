import { useEffect, useState } from 'react';
import { useXiangong } from '../../hooks/CloudControls/useXiangong';
import { sdpppX } from '../../../../../src/common/sdpppX.mts';
import { shell } from 'uxp';
import { useSDPPPInternalContext } from 'src/contexts/sdppp-internal';
import { useTraceUpdate } from '../../../../../src/common/tsx/util';

export function CloudControl({
    cloudControlValid, setCloudControlValid,
}: {
    cloudControlValid: boolean, setCloudControlValid: (valid: boolean) => void
}) {
    const {
        setBackendURL,
        connectState, doConnectOrDisconnect,    
    } = useSDPPPInternalContext();
    const [apiKey, _setApiKey] = useState<string>('');
    function setApiKey(apiKey: string) {
        localStorage.setItem('apiKey', apiKey);
        _setApiKey(apiKey);
    }
    useEffect(() => {
        const apiKey = localStorage.getItem('apiKey');
        if (apiKey) {
            setApiKey(apiKey);
        }
    }, []);

    return (
        <div className="client-panel-block">
            <div className="client-panel-title">
                {cloudControlValid ? '连接云端' : '或 连接云端'}
            </div>
            {cloudControlValid ? <a style={{ color: 'var(--uxp-host-text-color-secondary)', fontSize: '12px', position: 'absolute', right: '0', top: '0', cursor: 'pointer' }} onClick={() => {
                setApiKey('');
                setCloudControlValid(false);
                setBackendURL('');
                if (connectState === 'connected') {
                    doConnectOrDisconnect();
                }
            }}>重设API令牌或按地址连接</a> : ''}
            {!cloudControlValid && <div className="connect-box api-key-input">
                <sp-textfield
                    id="api-key" 
                    label="API Key"
                    onBlur={(ev: any) => { setApiKey(ev.currentTarget.value); }}
                    value={apiKey || ''}
                    placeholder="填入仙宫云/晨羽智云的API令牌"
                    style={{ flex: '1' }}
                ></sp-textfield>
            </div>}
            {!apiKey && <a onClick={() => shell.openExternal('https://www.xiangongyun.com/console/user/accesstoken')}>如何获取仙宫云API令牌？</a>}
            {apiKey && <CloudControlXiangong apiKey={apiKey} clearApiKey={() => setApiKey('')} setApiKeyValid={setCloudControlValid} />}
        </div>
    );
}

export function CloudControlXiangong({ apiKey, clearApiKey, setApiKeyValid }: {
    apiKey: string, clearApiKey: () => void, setApiKeyValid: (valid: boolean) => void
}) {
    const {
        instances,
        instancesLoading,
        balance,
        balanceLoading,
        balanceError,
        createInstance,
        createInstanceLoading,
        destroyInstance,
        destroyInstanceLoading,
        startInstance,
        startInstanceLoading,
    } = useXiangong({ apiKey });
    const {
        setBackendURL,
        connectState, doConnectOrDisconnect,
    } = useSDPPPInternalContext();

    const [createInstanceError, setCreateInstanceError] = useState<string>('');

    const handleCreateInstance = async () => {
        if (createInstanceLoading) {
            return;
        }
        try {
            const res = await createInstance(sdpppX.cloudControls.xiangong.instanceConfig);
        } catch (error: any) {
            console.error(error);
            setCreateInstanceError(error.message);
        }
    };

    useEffect(() => {
        if (apiKey && balance && !balanceError) {
            setApiKeyValid(true);
            setBackendURL('');
        }
    }, [balance, balanceError, apiKey]);

    const [hoverInstanceId, setHoverInstanceId] = useState<string | null>(null);

    return (
        <div className="xiangong-control">
            <div className="xiangong-control-header">
                <div className="instances-section-header">
                    <sp-action-button
                        onClick={handleCreateInstance}
                        variant="primary"
                        class="action-button"
                    >
                        {createInstanceLoading ? '创建中...' : '创建实例'}
                    </sp-action-button>
                </div>

                <div className="balance-section">
                    <sp-label class="balance-label">仙宫云余额: {balanceLoading || !balance ? '加载中...' : (+balance.balance).toFixed(2)}</sp-label>
                    <div className="actions-section">
                        <sp-action-button
                            onClick={() => shell.openExternal('https://www.xiangongyun.com/console/finance/recharge')}
                            variant="secondary"
                            className="action-button"
                        >
                            充值
                        </sp-action-button>
                    </div>
                </div>
            </div>
            <div className="instances-section">
                {createInstanceError && <sp-label style={{ color: 'lightcoral' }}>{createInstanceError}</sp-label>}
                {instances?.length === 0 && <sp-label>暂无实例, 请点击创建</sp-label>}
                {instancesLoading ? (
                    <sp-label>加载中...</sp-label>
                ) : (
                    <div className="instance-list">
                        {instances?.map((instance) => (
                            <div key={instance.id} className="instance-item"
                                onMouseEnter={() => setHoverInstanceId(instance.id)}
                                onMouseLeave={() => setHoverInstanceId(null)}
                            >
                                <div className="instance-info">
                                    <sp-label>实例ID: {instance.id}</sp-label>
                                    <sp-label>GPU型号: {instance.gpu_model}</sp-label>
                                    <sp-label style={{ color: 'var(--uxp-host-text-color)' }}>状态: {statusToText(instance.status)}</sp-label>
                                </div>
                                {instance.status === 'running' && <sp-action-button
                                        style={{ position: 'absolute', left: '50%', top: '35%' }}
                                        quiet
                                        class="instance-action-button"
                                        onClick={() => shell.openExternal(`https://${instance.id}-8081.container.x-gpu.com/files/`)}
                                    >输出目录</sp-action-button>}
                                <div className="instance-actions"
                                    style={{ display: hoverInstanceId === instance.id ? 'flex' : 'none' }}
                                >
                                    {instance.status === 'running' && <sp-action-button
                                        onClick={async () => {
                                            doConnectOrDisconnect(`https://${instance.id}-8188.container.x-gpu.com/`)
                                        }}
                                        class="connect-button"
                                    >
                                        {connectState !== 'disconnected' ? '断开连接' : '连接'}
                                    </sp-action-button>}
                                    {instance.status === 'shutdown' && <sp-action-button
                                        onClick={async () => {
                                            if (startInstanceLoading) return;
                                            await startInstance({ id: instance.id })
                                        }}
                                        class="instance-action-button"
                                    >
                                        {startInstanceLoading ? '启动中...' : '启动'}
                                    </sp-action-button>}
                                    {instance.status === 'running' && <sp-action-button
                                        quiet
                                        onClick={() => destroyInstance({ id: instance.id })}
                                        class="instance-action-button"
                                        style={{ color: 'lightcoral' }}
                                    >
                                        {destroyInstanceLoading ? '销毁中...' : '销毁'}
                                    </sp-action-button>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function statusToText(status: string) {
    switch (status) {
        case 'running':
            return '运行中';
        case 'deploying':
            return '部署中';
        case 'shutting_down':
            return '关闭中';
        case 'shutdown_backing_up':
            return '备份中';
        case 'shutdown':
            return '已关闭';
        case 'booting':
            return '正在开机';
        case 'destroying':
            return '销毁中';
        default:
            return status;
    }
}