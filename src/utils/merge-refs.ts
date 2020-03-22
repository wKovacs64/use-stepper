const mergeRefs = <T>(
  ...refs: Array<React.LegacyRef<T> | React.MutableRefObject<T> | undefined>
): ((ref: T) => void) => (ref: T): void => {
  refs.forEach((resolvableRef) => {
    if (typeof resolvableRef === 'function') {
      resolvableRef(ref);
    } else if (typeof resolvableRef === 'object' && resolvableRef !== null) {
      // eslint-disable-next-line no-param-reassign
      (resolvableRef as React.MutableRefObject<T>).current = ref;
    }
  });
};

export default mergeRefs;
