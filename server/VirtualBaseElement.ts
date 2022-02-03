// Virtual elements for HomeDing Portal and Development Server

// a virtual element that can be used for mocking and proxying to real existing element in HomeDing devices.
// The VirtualBaseElement actually does nothing but returning the static defined state.

import { EventBusClass } from "./EventBus.js";

export class VirtualBaseElement {
  /** type of the virtual element */
  type: string;

  /** id of the virtual element */
  id: string;

  /** "type/id" of the virtual element */
  typeId: string;

  protected eventBus!: EventBusClass;

  config: any;
  state: any = { active: true };

  constructor(type: string, id: string) {
    this.type = type;
    this.id = id;
    this.typeId = `${type}/${id}`;
  }

  setConfig(_bus: EventBusClass, config: any, _default = {}) {
    this.eventBus = _bus;
    this.config = Object.assign({}, _default, config);
  }

  /** return the actual state from the element */
  async getState(): Promise<any> { return (this.state); }
  async doAction(_query: any) {
    // empty
  }

  loop() {
    // empty
  }
}

// End.
