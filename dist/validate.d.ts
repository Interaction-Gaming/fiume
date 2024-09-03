import type { State } from "./state.js";
export declare class InvalidStatesError extends Error {
}
export declare class InvalidInitialStateError extends Error {
}
export declare class InvalidStateIdError extends Error {
}
export declare class InvalidTransitionCondition extends Error {
}
export declare function validateStates<TContext, TEvent, TSharedData>(states: Array<State<TContext, TEvent, TSharedData>>): void;
export declare function validateHydration<TContext, TEvent, TSharedData>(states: Array<State<TContext, TEvent, TSharedData>>, currentStateId: string): void;
