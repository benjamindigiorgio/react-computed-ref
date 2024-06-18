import { renderHook, act, waitFor } from "@testing-library/react";
import { useSignal, useComputed } from "../src";

const useMockComponent = () => {
  const count = useSignal(0);
  const other = useSignal(10);

  const doubled = useComputed(() => count.value * 2);
  const sum = useComputed(() => count.value + other.value);

  const stringTest = useComputed(() => {
    if (doubled !== 0) return "positive";
    else return "zero";
  });

  const complexComputed = useComputed(() => {
    return doubled + sum + count.value;
  });

  return { count, other, doubled, sum, stringTest, complexComputed };
};

describe("useSignal and useComputed", () => {
  it("should correctly compute initial values", () => {
    const { result } = renderHook(() => useMockComponent());

    expect(result.current.stringTest).toBe("zero");
    expect(result.current.doubled).toBe(0);
    expect(result.current.sum).toBe(10);
    expect(result.current.complexComputed).toBe(10);
  });

  it("should recompute values when dependencies change", () => {
    const { result } = renderHook(() => useMockComponent());

    act(() => {
      result.current.count.value = 2;
    });

    expect(result.current.stringTest).toBe("positive");
    expect(result.current.doubled).toBe(4);
    expect(result.current.sum).toBe(12);
    expect(result.current.complexComputed).toBe(18);

    act(() => {
      result.current.other.value = 20;
    });

    expect(result.current.sum).toBe(22);
    expect(result.current.complexComputed).toBe(28);
  });

  it("should handle rapid updates", () => {
    const { result } = renderHook(() => useMockComponent());

    act(() => {
      for (let i = 0; i < 100; i++) {
        result.current.count.value += 1;
      }
    });
    waitFor(() => {
      expect(result.current.doubled).toBe(200);
      expect(result.current.sum).toBe(210);
      expect(result.current.stringTest).toBe("positive");
      expect(result.current.complexComputed).toBe(410);
    });
  });

  it("should handle nested signals and computed values", () => {
    const useNestedSignals = () => {
      const outer = useSignal({ inner: 0 });
      const computedInner = useComputed(() => outer.value.inner * 2);

      return { outer, computedInner };
    };

    const { result } = renderHook(() => useNestedSignals());

    expect(result.current.computedInner).toBe(0);

    act(() => {
      result.current.outer.value.inner = 5;
    });
    waitFor(() => {
      expect(result.current.computedInner).toBe(10);
    });
  });

  it("should handle asynchronous updates correctly", async () => {
    const { result } = renderHook(() => useMockComponent());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      result.current.count.value = 5;
    });

    waitFor(() => {
      expect(result.current.count.value).toBe(5);
      expect(result.current.doubled).toBe(10);
      expect(result.current.sum).toBe(15);
      expect(result.current.complexComputed).toBe(35);
    });
  });

  it("should handle multiple signals and recomputed values", () => {
    const useMultipleSignals = () => {
      const signal1 = useSignal(0);
      const signal2 = useSignal(10);

      const combined = useComputed(() => signal1.value + signal2.value);

      return { signal1, signal2, combined };
    };

    const { result } = renderHook(() => useMultipleSignals());

    expect(result.current.combined).toBe(10);

    act(() => {
      result.current.signal1.value = 5;
    });

    expect(result.current.combined).toBe(15);

    act(() => {
      result.current.signal2.value = 20;
    });

    expect(result.current.combined).toBe(25);
  });
});
