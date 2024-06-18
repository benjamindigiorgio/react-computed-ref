import { renderHook, act, waitFor } from "@testing-library/react";
import { useState } from "react";
import { useComputed } from "../src/computed";

// Mock component to use state and the useComputed hook
const useMockComponent = () => {
  const [count, setCount] = useState(0);
  const [other, setOther] = useState(10);

  const doubled = useComputed(() => count * 2);
  const sum = useComputed(() => count + other);

  const stringTest = useComputed(() => {
    if (doubled !== 0) return "positive";
    else return "zero";
  });

  return { count, setCount, other, setOther, doubled, sum, stringTest };
};

describe("useComputed", () => {
  it("should correctly compute initial values", () => {
    const { result } = renderHook(() => useMockComponent());

    expect(result.current.stringTest).toBe("zero");
    expect(result.current.doubled).toBe(0);
    expect(result.current.sum).toBe(10);
  });

  it("should recompute values when dependencies change", () => {
    const { result } = renderHook(() => useMockComponent());

    act(() => {
      result.current.setCount(2);
    });

    waitFor(() => {
      expect(result.current.stringTest).toBe("positive");
      expect(result.current.doubled).toBe(4);
      expect(result.current.sum).toBe(12);
    });

    act(() => {
      result.current.setOther(20);
    });

    waitFor(() => {
      expect(result.current.sum).toBe(22);
    });
  });

  it("should handle rapid updates", () => {
    const { result } = renderHook(() => useMockComponent());

    act(() => {
      for (let i = 0; i < 100; i++) {
        result.current.setCount((prev) => prev + 1);
      }
    });

    waitFor(() => {
      expect(result.current.doubled).toBe(200);
      expect(result.current.sum).toBe(210);
      expect(result.current.stringTest).toBe("positive");
    });
  });

  it("should handle multiple state changes", () => {
    const { result } = renderHook(() => useMockComponent());

    act(() => {
      result.current.setCount(5);
      result.current.setOther(15);
    });

    waitFor(() => {
      expect(result.current.doubled).toBe(10);
      expect(result.current.sum).toBe(20);
      expect(result.current.stringTest).toBe("positive");
    });

    act(() => {
      result.current.setCount(0);
    });

    waitFor(() => {
      expect(result.current.doubled).toBe(0);
      expect(result.current.sum).toBe(15);
      expect(result.current.stringTest).toBe("zero");
    });
  });

  it("should handle complex dependencies", () => {
    const { result } = renderHook(() => useMockComponent());

    const { result: complexResult } = renderHook(() =>
      useComputed(() => {
        return (
          result.current.doubled + result.current.sum + result.current.count
        );
      })
    );

    expect(complexResult.current).toBe(10); // 0 (doubled) + 10 (sum) + 0 (count)

    act(() => {
      result.current.setCount(2);
    });

    waitFor(() => {
      expect(complexResult.current).toBe(18); // 4 (doubled) + 12 (sum) + 2 (count)
    });

    act(() => {
      result.current.setOther(20);
    });

    waitFor(() => {
      expect(complexResult.current).toBe(26); // 4 (doubled) + 22 (sum) + 2 (count)
    });
  });

  it("should handle no dependencies gracefully", () => {
    const { result } = renderHook(() => useComputed(() => 42));

    expect(result.current).toBe(42);
  });

  it("should work with non-primitive values", () => {
    const useObjectMock = () => {
      const [obj, setObj] = useState({ count: 0 });

      const doubledCount = useComputed(() => {
        return obj.count * 2;
      });

      return { obj, setObj, doubledCount };
    };

    const { result } = renderHook(() => useObjectMock());

    expect(result.current.doubledCount).toBe(0);

    act(() => {
      result.current.setObj({ count: 5 });
    });

    waitFor(() => {
      expect(result.current.doubledCount).toBe(10);
    });
  });
});
