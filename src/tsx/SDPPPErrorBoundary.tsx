import React from "react";
import i18n from "../../../../src/common/i18n.mts";

export default class SDPPPErrorBoundary extends React.Component<{
    children: any
}, {
    hasError: boolean,
    errorMessage: string
}> {
    state = { hasError: false, errorMessage: '' };
    constructor(props: any) {
        super(props);
    } 

    static getDerivedStateFromError(error: any) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, errorMessage: error.toString() };
    }

    componentDidCatch(error: any, errorInfo: any) {
        // You can also log the error to an error reporting service
        console.log(error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return <p className="list-error-label">{i18n('Error {0}... please contact me via Discord/Github', this.state.errorMessage)}</p>;
        }

        return this.props.children;
    }
}
