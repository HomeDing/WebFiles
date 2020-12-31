// Virtual elements for HomeDing Portal and Development Server


// a virtual element that can be used for mocking and proxying to real existing element in HomeDing devices.
// The VirtualBaseElement actually does nothing but returning the static defined state.

export class VirtualBaseElement {
  /** type of the virtual element */
  type: string;

  /** id of the virtual element */
  id: string;

  /** "type/id" of the virtual element */
  typeId: string;

  config: any;
  state: any = { active: true };

  constructor(typeId: string, config: any) {
    this.typeId = typeId;
    this.type = typeId.split('/')[0];
    this.id = typeId.split('/')[1];
    this.config = config;
  }

  /** return the actual state from the element */
  async getState(): Promise<any> { return (this.state); }
  async doAction(_query: any) { }
}


/** registered virtual elements classes */
const registry: { [x: string]: typeof VirtualBaseElement; } = {};

/** activated virtual elements */
const activeVirtuals: { [x: string]: VirtualBaseElement; } = {};


/** Register a class for an element type. */
export function register(type: string, imp: typeof VirtualBaseElement) {
  registry[type] = imp;
}

/** add a virtual element */
export function add(typeId: string, impl: VirtualBaseElement) {
  activeVirtuals[typeId] = impl;
}


/** add a virtual element */
export function addElement(impl: VirtualBaseElement) {
  activeVirtuals[impl.typeId] = impl;
}

/** Activate virtual elements for all configured elements. */
export function activate(allConfig: any) {
  Object.keys(registry).forEach(typeName => {
    const tConf = allConfig[typeName];
    if (tConf) {
      Object.keys(tConf).forEach(e => {
        const c = new registry[typeName](typeName + '/' + e, tConf[e]);
        activeVirtuals[c.typeId] = c;
      }
      );
    }
  });
}


/** Process an action for a given element. */
export function action(typeId: string, cmd: any) {
  const ve: VirtualBaseElement = activeVirtuals[typeId];
  if (ve) { ve.doAction(cmd); }
} // action()


/** Return the state of a single element. */
export async function state(typeId: string) {
  const ve: VirtualBaseElement = activeVirtuals[typeId];
  if (ve) {
    return (ve.getState());
  } else {
    return ({});
  }
} // state()


/** return the state of all virtual elements */
export async function allState() {
  const all: any = {};

  for (const eId in activeVirtuals) {
    if (activeVirtuals.hasOwnProperty(eId)) {
      all[eId] = await activeVirtuals[eId].getState();
    }
  }
  return (all);
} // allState()

// End.
