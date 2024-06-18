import { useState, useEffect, useRef } from "react";

/**
 * Custom hook that computes a value and updates it whenever the dependencies change.
 *
 * @template T - The type of the computed value.
 * @param {() => T} computeFn - The function that computes the value.
 * @returns {T} - The computed value.
 */
const useComputed = <T>(computeFn: () => T): T => {
  const [value, setValue] = useState(computeFn);
  const computeFnRef = useRef(computeFn);

  useEffect(() => {
    computeFnRef.current = computeFn;
  }, [computeFn]);

  useEffect(() => {
    const computeValue = () => {
      const newValue = computeFnRef.current();
      setValue(newValue);
    };

    computeValue();

    const rerender = () => {
      computeValue();
    };

    // Register the rerender function for any state updates
    const cleanupFns: (() => void)[] = [];
    const addDependency = (setter: Function) => {
      const original = setter;
      const wrapped = (...args: any[]) => {
        original(...args);
        rerender();
      };
      Object.assign(setter, wrapped);
      cleanupFns.push(() => Object.assign(setter, original));
    };

    const stateProxy = new Proxy(
      {},
      {
        get(target, prop, receiver) {
          const original = Reflect.get(target, prop, receiver);
          if (
            typeof original === "function" &&
            typeof prop === "string" &&
            prop.startsWith("set")
          ) {
            addDependency(original);
          }
          return original;
        },
      }
    );

    // Execute computeFn to capture all dependencies
    computeFnRef.current = new Proxy(computeFnRef.current, {
      apply(target, thisArg, args) {
        return stateProxy;
      },
    });

    return () => {
      // Cleanup proxy on unmount
      cleanupFns.forEach((fn) => fn());
    };
  }, [computeFn]);

  return value;
};

export { useComputed };
