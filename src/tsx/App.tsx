import { useStore } from 'zustand'
import './App.less'
import { sdpppSDK } from '../sdk/sdppp-ps-sdk'
import { Button, ConfigProvider, Flex, Select, theme } from 'antd'
import { Providers } from '../providers'
import { useMemo, useState } from 'react'
import { MainStore } from './App.store'
import ImagePreview from './components/ImagePreview'
 
export default function App() {
    const psTheme = useStore(sdpppSDK.stores.PhotoshopStore, state => state.theme)
    const provider = MainStore(state => state.provider)
    const showingPreview = MainStore(state => state.showingPreview)
    const previewImageList = MainStore(state => state.previewImageList)
    
    const Renderer = useMemo(() => {
        return provider ? Providers[provider].Renderer : null
    }, [provider])

    const fontSize = 12

    return <div id="app" className={themeClassName(psTheme)}>
        <ConfigProvider
            getPopupContainer={trigger => trigger?.parentElement || document.body}
            theme={{
                token: {
                    colorPrimary: '#34773d',
                },
                algorithm: [psTheme === 'kPanelBrightnessDarkGray' || psTheme === 'kPanelBrightnessMediumGray' ? theme.darkAlgorithm : theme.defaultAlgorithm, theme.compactAlgorithm],
                components: {
                    Input: {
                        fontSize: fontSize,
                        colorBgContainer: 'var(--sdppp-widget-background-color)',
                        colorText: 'var(--sdppp-host-text-color)',
                        colorBorder: 'var(--sdppp-widget-border-color)',
                        colorTextPlaceholder: 'var(--sdppp-host-text-color-secondary)'
                    },
                    Select: {
                        fontSize: fontSize,
                        colorBgContainer: 'var(--sdppp-widget-background-color)',
                        colorText: 'var(--sdppp-host-text-color)',
                        colorBorder: 'var(--sdppp-widget-border-color)',
                        colorBgElevated: 'var(--sdppp-widget-background-color)',
                        colorTextDescription: 'var(--sdppp-host-text-color)',
                        controlItemBgActive: 'var(--sdppp-widget-border-color)',
                        controlItemBgHover: 'var(--sdppp-widget-hover-background-color)',
                        optionSelectedBg: 'var(--sdppp-widget-border-color)',
                        optionActiveBg: 'var(--sdppp-widget-hover-background-color)',
                        colorTextPlaceholder: 'var(--sdppp-host-text-color-secondary)',
                    },
                    Checkbox: {
                        fontSize: fontSize,
                        colorText: 'var(--sdppp-host-text-color)',
                    },
                    Radio: {
                        fontSize: fontSize,
                    },
                    Slider: {
                        fontSize: fontSize,
                    },
                    Switch: {
                        fontSize: fontSize,
                        colorBgContainer: 'var(--sdppp-widget-background-color)',
                        colorText: 'var(--sdppp-host-text-color)'
                    },
                    InputNumber: {
                        fontSize: fontSize,
                        colorBgContainer: 'var(--sdppp-widget-background-color)',
                        colorText: 'var(--sdppp-host-text-color)',
                        colorBorder: 'var(--sdppp-widget-border-color)'
                    },
                    Upload: {
                        fontSize: fontSize,
                        colorBgContainer: 'var(--sdppp-widget-background-color)',
                        colorText: 'var(--sdppp-host-text-color)',
                        colorBorder: 'var(--sdppp-widget-border-color)'
                    },
                    Button: {
                        fontSize: fontSize,
                        colorBgContainer: 'var(--sdppp-widget-background-color)',
                        colorText: 'var(--sdppp-host-text-color)',
                        colorBorder: 'var(--sdppp-widget-border-color)'
                    },
                }
            }}>
            {!showingPreview && previewImageList.length ? <Flex gap={8} justify="center" align="center" style={{ marginBottom: 16 }}>
                <Button size="small" type="primary" onClick={() => MainStore.setState({ showingPreview: true })}>
                    显示预览框 ({previewImageList.length}张图片)
                </Button>
            </Flex> : null}
            {!showingPreview ? <Select
                className='app-select'
                showSearch={true}
                value={provider}
                onChange={value => MainStore.setState({ provider: value as (keyof typeof Providers) | '' })}
            >
                <Select.Option value="">请选择AI服务</Select.Option>
                {
                    Object.keys(Providers)
                        .map(key => <Select.Option key={key} value={key}>{key}</Select.Option>)
                }
            </Select> : null}
            {
                showingPreview ? <ImagePreview/> : null
            }
            {Renderer && <Renderer showingPreview={showingPreview} />}
        </ConfigProvider>
    </div>
}

function themeClassName(theme: string) {
    if (theme == "kPanelBrightnessLightGray") {
        return "__ps_light__"
    }
    if (theme == "kPanelBrightnessMediumGray") {
        return "__ps_dark__"
    }
    if (theme == "kPanelBrightnessDarkGray") {
        return "__ps_darkest__"
    }
    return "__ps_lightest__"
}