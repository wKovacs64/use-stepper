type Ref<T> = React.LegacyRef<T> | React.MutableRefObject<T> | undefined;

function isMutableRefObject<T>(ref: Ref<T>): ref is React.MutableRefObject<T> {
  return typeof ref === 'object' && ref !== null && 'current' in ref;
}

export function mergeRefs<T>(...refs: Ref<T>[]): (ref: T) => void {
  function assignSingleRef(ref: T) {
    refs.forEach((resolvableRef) => {
      if (typeof resolvableRef === 'function') {
        resolvableRef(ref);
      } else if (isMutableRefObject(resolvableRef)) {
        // eslint-disable-next-line no-param-reassign
        resolvableRef.current = ref;
      }
    });
  }
  return assignSingleRef;
}
