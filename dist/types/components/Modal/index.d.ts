import { FunctionComponent, ReactNode } from 'react';
import Modal from 'react-modal';
export declare type Props = Modal.Props & {
    children: ReactNode;
    isOpen: boolean;
    onClose: () => void;
    className?: string;
    contentClassName?: string;
    scrollable?: boolean;
};
declare const ControlledModal: FunctionComponent<Props>;
export default ControlledModal;
