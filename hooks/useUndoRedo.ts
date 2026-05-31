"use client";

import { useCallback, useReducer } from "react";

type HistoryState<T> = {
  present: T;
  past: T[];
  future: T[];
};

type Action<T> =
  | { type: "set"; updater: (prev: T) => T; record: boolean }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "reset"; value: T };

function reducer<T>(
  state: HistoryState<T>,
  action: Action<T>,
  maxHistory: number
): HistoryState<T> {
  switch (action.type) {
    case "set": {
      const value = action.updater(state.present);
      if (!action.record || JSON.stringify(value) === JSON.stringify(state.present)) {
        return { ...state, present: value };
      }
      return {
        present: value,
        past: [...state.past.slice(-(maxHistory - 1)), state.present],
        future: [],
      };
    }
    case "undo": {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      return {
        present: previous,
        past: state.past.slice(0, -1),
        future: [state.present, ...state.future],
      };
    }
    case "redo": {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      return {
        present: next,
        past: [...state.past, state.present],
        future: state.future.slice(1),
      };
    }
    case "reset":
      return { present: action.value, past: [], future: [] };
    default:
      return state;
  }
}

export function useUndoRedo<T>(initial: T, maxHistory = 50) {
  const [state, dispatch] = useReducer(
    (s: HistoryState<T>, a: Action<T>) => reducer(s, a, maxHistory),
    { present: initial, past: [], future: [] }
  );

  const set = useCallback((next: T | ((prev: T) => T), recordHistory = true) => {
    dispatch({
      type: "set",
      updater:
        typeof next === "function" ? (next as (prev: T) => T) : () => next as T,
      record: recordHistory,
    });
  }, []);

  const undo = useCallback(() => dispatch({ type: "undo" }), []);
  const redo = useCallback(() => dispatch({ type: "redo" }), []);
  const reset = useCallback((v: T) => dispatch({ type: "reset", value: v }), []);

  return {
    value: state.present,
    set,
    undo,
    redo,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    reset,
  };
}
