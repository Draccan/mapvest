import { useGlobalErrorHandler } from "../../commons/hooks/useGlobalErrorHandler";

interface Props {
    children: React.ReactNode;
}

export const RoutesWrapper: React.FC<Props> = ({ children }) => {
    useGlobalErrorHandler();

    return <div>{children}</div>;
};
