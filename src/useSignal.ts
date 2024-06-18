import { useState, useRef, useEffect } from "react";

type Signal<T> = {
  value: T;
};

/**
 * Creates a signal with initial value and provides getter and setter methods.
 *
 * @template T - The type of the signal value.
 * @param {T} initialValue - The initial value of the signal.
 * @returns {Signal<T>} - The signal object with getter and setter methods.
 */
const useSignal = <T>(initialValue: T | (() => T)): Signal<T> => {
  const [state, setState] = useState<T>(
    typeof initialValue === "function"
      ? (initialValue as () => T)()
      : initialValue
  );
  const stateRef = useRef<T>(state);

  const signal = new Proxy(
    {},
    {
      get(_, prop) {
        if (prop === "value") {
          return stateRef.current;
        }
        return stateRef.current[prop as keyof T];
      },
      set(_, prop, value) {
        if (prop === "value") {
          stateRef.current = value;
          setState(value);
          return true;
        }
        if (stateRef.current && typeof stateRef.current === "object") {
          (stateRef.current as any)[prop] = value;
          setState({ ...stateRef.current });
          return true;
        }
        return false;
      },
    }
  );

  useEffect(() => {
    if (typeof initialValue === "function") {
      const derivedValue = (initialValue as () => T)();
      stateRef.current = derivedValue;
      setState(derivedValue);
    }
  }, [initialValue]);

  return signal as Signal<T>;
};

export { useSignal };
