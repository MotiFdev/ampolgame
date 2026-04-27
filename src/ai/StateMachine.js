export class StateMachine {
    constructor(context) {
        this.context = context;
        this.states = new Map();
        this.currentState = null;
        this.previousState = null;
    }
    
    addState(name, config) {
        this.states.set(name, {
            onEnter: config.onEnter || (() => {}),
            onUpdate: config.onUpdate || (() => {}),
            onExit: config.onExit || (() => {})
        });
        return this;
    }
    
    setState(name) {
        if (!this.states.has(name)) {
            console.warn(`State ${name} doesn't exist`);
            return;
        }
        
        if (this.currentState) {
            this.states.get(this.currentState).onExit.call(this.context);
        }
        
        this.previousState = this.currentState;
        this.currentState = name;
        this.states.get(this.currentState).onEnter.call(this.context);
    }
    
    update(time, delta) {
        if (this.currentState) {
            this.states.get(this.currentState).onUpdate.call(this.context, time, delta);
        }
    }
    
    revertToPreviousState() {
        if (this.previousState) {
            this.setState(this.previousState);
        }
    }
}