import { validateHydration, validateStates } from "./validate.js";
const PREVENT_COSTRUCTOR_INSTANCE = Symbol("fiume.prevent-constructor");
export class InvalidTransition extends Error {
}
export class InvalidConstructor extends Error {
}
export class StateMachine {
    id;
    context;
    #finished = false;
    #current;
    #initial;
    #states;
    #sharedData;
    #subscriptions;
    constructor(states, options, symbol, currentStateId) {
        if (symbol !== PREVENT_COSTRUCTOR_INSTANCE) {
            throw new InvalidConstructor("StateMachine must be created with `StateMachine.from`");
        }
        this.id = options?.id || crypto.randomUUID();
        this.context = options?.context || {};
        this.#sharedData = options?.sharedData || {};
        this.#states = new Map(states.map((s) => [s.id, s]));
        this.#subscriptions = new Map();
        this.#initial = currentStateId
            ? this.#states.get(currentStateId)
            : states.find((s) => s.initial);
    }
    get currentStateId() {
        return this.#current.id;
    }
    get sharedData() {
        return this.#sharedData;
    }
    get isFinished() {
        return this.#finished;
    }
    createSnapshot() {
        return {
            snapshotId: crypto.randomUUID(),
            machineId: this.id,
            stateId: this.#current.id,
            context: structuredClone(this.context),
        };
    }
    static fromSnapshot(snapshot, states, sharedData) {
        const stateId = snapshot.stateId;
        validateHydration(states, stateId);
        const stateMachineOptions = {
            id: snapshot.machineId,
            context: snapshot.context,
            sharedData,
        };
        return new StateMachine(states, stateMachineOptions, PREVENT_COSTRUCTOR_INSTANCE, stateId);
    }
    static from(states, options) {
        validateStates(states);
        return new StateMachine(states, options, PREVENT_COSTRUCTOR_INSTANCE);
    }
    async send(event) {
        if (this.#finished) {
            throw new InvalidTransition("Machine cannot send to a machine in final state");
        }
        const hookInput = {
            context: this.context,
            sharedData: this.#sharedData,
            event,
        };
        const current = this.#current;
        if (current.transitionGuard &&
            !(await current.transitionGuard(hookInput))) {
            return;
        }
        await this.executeState(this.#current, event);
    }
    async start() {
        await this.enter(this.#initial);
    }
    async enter(state, event) {
        this.#current = state;
        if (state.onEntry) {
            await state.onEntry({
                context: this.context,
                sharedData: this.#sharedData,
                event,
            });
        }
        for (const sub of this.#subscriptions.values()) {
            sub({
                context: this.context,
                currentStateId: this.#current.id,
                sharedData: this.#sharedData,
                event,
            });
        }
        if (state.final ||
            state.autoTransition) {
            await this.executeState(this.#current);
        }
    }
    async executeState(state, event) {
        this.#current = state;
        let destination;
        const g = state;
        if (g.transitionTo) {
            const destinationId = await g.transitionTo({
                context: this.context,
                sharedData: this.#sharedData,
                event,
            });
            destination = this.#states.get(destinationId);
        }
        if (state.onExit) {
            await state.onExit({
                context: this.context,
                sharedData: this.#sharedData,
                event,
            });
        }
        const f = state;
        if (f.final) {
            if (f.onFinal) {
                await f.onFinal({
                    context: this.context,
                    sharedData: this.#sharedData,
                    event,
                });
            }
            this.#finished = true;
            return;
        }
        if (!destination)
            throw new InvalidTransition("Invalid destination node");
        await this.enter(destination, event);
    }
    subscribe(callback) {
        const id = crypto.randomUUID();
        this.#subscriptions.set(id, callback);
        return id;
    }
    unsubscribe(id) {
        this.#subscriptions.delete(id);
    }
}
