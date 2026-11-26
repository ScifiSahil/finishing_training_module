// Runs an async loader when the screen opens (and again when reload() is called).
// Returns { data, loading, error, reload }.
import { useCallback, useEffect, useRef, useState } from "react";

export function useAsync(loader, deps) {
  const [state, setState] = useState({ data: null, loading: true, error: "" });
  const alive = useRef(true);

  const run = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: "" }));
    return loader().then(
      (data) => alive.current && setState({ data, loading: false, error: "" }),
      (e) => alive.current && setState((s) => ({ ...s, loading: false, error: e.message || "Failed" }))
    );
  }, deps || []);

  useEffect(() => {
    alive.current = true;
    run();
    return () => {
      alive.current = false;
    };
  }, [run]);

  return { ...state, reload: run };
}
