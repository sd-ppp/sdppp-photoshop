interface QuickSetterProps {
    onClick: () => void,
    label: string
}
export default function QuickSetter(props: QuickSetterProps) {
    return (
        <a onClick={props.onClick}>{props.label}</a>
    )
}