declare const useButtonAnimation: (iterateValues: number[], transitionDelay: number) => {
    current: number;
    onHover: (current: number) => void;
    onLeave: () => void;
};
export default useButtonAnimation;
