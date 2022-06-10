declare type Props = {
    current: number;
    onHover: (current: number) => void;
    onLeave: () => void;
};
declare const useButtonAnimation: (iterateValues: number[], transitionDelay: number) => Props;
export default useButtonAnimation;
