import { renderHook, act } from "@testing-library/react";
import { useSignal } from "../src/useSignal";

describe("useSignal", () => {
  it("should initialize with the correct value", () => {
    const { result } = renderHook(() => useSignal(0));
    expect(result.current.value).toBe(0);
  });

  it("should update the value correctly", () => {
    const { result } = renderHook(() => useSignal(0));

    act(() => {
      result.current.value = 5;
    });

    expect(result.current.value).toBe(5);

    act(() => {
      result.current.value += 1;
    });

    expect(result.current.value).toBe(6);
  });

  it("should work with non-primitive values", () => {
    const { result } = renderHook(() => useSignal({ count: 0 }));

    act(() => {
      result.current.value.count = 5;
    });

    expect(result.current.value.count).toBe(5);
  });

  it("should handle rapid updates", () => {
    const { result } = renderHook(() => useSignal(0));

    act(() => {
      for (let i = 0; i < 100; i++) {
        result.current.value += 1;
      }
    });

    expect(result.current.value).toBe(100);
  });

  it("should handle nested objects correctly", () => {
    const { result } = renderHook(() => useSignal({ nested: { count: 0 } }));

    act(() => {
      result.current.value.nested.count = 5;
    });

    expect(result.current.value.nested.count).toBe(5);

    act(() => {
      result.current.value.nested.count += 3;
    });

    expect(result.current.value.nested.count).toBe(8);
  });

  it("should interact correctly with multiple signals", () => {
    const useMultipleSignals = () => {
      const signal1 = useSignal(0);
      const signal2 = useSignal(10);

      const combined = useSignal(() => signal1.value + signal2.value);

      return { signal1, signal2, combined };
    };

    const { result } = renderHook(() => useMultipleSignals());

    expect(result.current.combined.value).toBe(10);

    act(() => {
      result.current.signal1.value = 5;
    });

    expect(result.current.combined.value).toBe(15);

    act(() => {
      result.current.signal2.value = 20;
    });

    expect(result.current.combined.value).toBe(25);
  });

  it("should handle asynchronous updates correctly", async () => {
    const { result } = renderHook(() => useSignal(0));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      result.current.value = 5;
    });

    expect(result.current.value).toBe(5);
  });

  it("should work with complex data structures", () => {
    const { result } = renderHook(() =>
      useSignal({ arr: [1, 2, 3], obj: { nested: 1 } })
    );

    act(() => {
      result.current.value.arr.push(4);
    });

    expect(result.current.value.arr).toEqual([1, 2, 3, 4]);

    act(() => {
      result.current.value.obj.nested = 2;
    });

    expect(result.current.value.obj.nested).toBe(2);
  });
});
