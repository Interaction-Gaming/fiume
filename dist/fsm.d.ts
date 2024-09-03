import type { State, SubscriptionIdentifier, SubscriptionCallback } from "./state.js";
export type StateMachineOptions<TContext = unknown, TSharedData = unknown> = {
    id?: string;
    context?: TContext;
    sharedData?: TSharedData;
};
export declare class InvalidTransition extends Error {
}
export declare class InvalidConstructor extends Error {
}
export type MachineSnapshot<TContext> = {
    snapshotId: string;
    machineId: string;
    stateId: string;
    context: TContext;
};
export declare class StateMachine<TContext = unknown, TEvent = unknown, TSharedData = unknown> {
    #private;
    id: string;
    context: TContext;
    private constructor();
    get currentStateId(): string;
    get sharedData(): TSharedData;
    get isFinished(): boolean;
    createSnapshot(): MachineSnapshot<TContext>;
    static fromSnapshot<TContext, TEvent, TSharedData>(snapshot: MachineSnapshot<TContext>, states: Array<State<TContext, TEvent, TSharedData>>, sharedData?: TSharedData): StateMachine<TContext, TEvent, TSharedData>;
    static from<TContext, TEvent, TSharedData>(states: Array<State<TContext, TEvent, TSharedData>>, options?: StateMachineOptions<TContext, TSharedData>): StateMachine<TContext, TEvent, TSharedData>;
    send(event: TEvent): Promise<void>;
    start(): Promise<void>;
    private enter;
    private executeState;
    subscribe(callback: SubscriptionCallback<TContext, TEvent, TSharedData>): SubscriptionIdentifier;
    unsubscribe(id: string): void;
}
