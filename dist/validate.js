export class InvalidStatesError extends Error {
}
export class InvalidInitialStateError extends Error {
}
export class InvalidStateIdError extends Error {
}
export class InvalidTransitionCondition extends Error {
}
export function validateStates(states) {
    if (!states || !Array.isArray(states) || states?.length < 1)
        throw new InvalidStatesError("States must be an array of at least 1 element");
    const initial = states.filter((s) => s.initial);
    if (initial.length !== 1) {
        throw new InvalidInitialStateError("There must be one and only initial state");
    }
    if (!states.every((s) => typeof s.id === "string")) {
        throw new InvalidStateIdError("Ids must be of type string");
    }
    const uniqueIds = new Set(states.map((s) => s.id));
    if (uniqueIds.size !== states.length) {
        throw new InvalidStateIdError("Ids must be unique");
    }
    if (
    // biome-ignore lint/suspicious/noExplicitAny: <during validation we can have unexpected types, that do not match existing>
    states.some((s) => s.autoTransition && s.transitionGuard)) {
        throw new InvalidTransitionCondition("State with autoTransition cannot have property transitionGuard");
    }
    if (states.some(
    // biome-ignore lint/suspicious/noExplicitAny: <during validation we can have unexpected types, that do not match existing>
    (s) => (!s.final && !s.transitionTo) ||
        (s.final && (s.autoTransition || s.transitionTo || s.transitionGuard)))) {
        throw new InvalidTransitionCondition("State must have autoTransition or transitionTo if not final");
    }
    // biome-ignore lint/suspicious/noExplicitAny: <during validation we can have unexpected types, that do not match existing>
    if (states.some((s) => !s.final && s.onFinal)) {
        throw new InvalidTransitionCondition("State that are not final cannot have property onFinal");
    }
}
export function validateHydration(states, currentStateId) {
    validateStates(states);
    if (!states.some((s) => s.id === currentStateId)) {
        throw new InvalidStateIdError("No state id matches with the state id provided");
    }
}
