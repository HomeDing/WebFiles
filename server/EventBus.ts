// EventBus.ts

import { VirtualBaseElement } from "./VirtualBaseElement";
import { RegistryClass } from "./Registry";
import Logger from "./Logger.js";

export class EventBusClass {
  private _registry?: RegistryClass;

  private events: string[] = [];

  /** all activated virtual elements */
  private activeVirtuals: { [x: string]: VirtualBaseElement; } = {};

  constructor(registry: RegistryClass) {
    this._registry = registry;
  }

  addElement(typeName: string, id: string, conf: any) {
    Logger.trace(`add ${typeName}/${id}: ${conf}`);
    const elem = this._registry?.newElement(typeName, id);
    if (elem) {
      elem.setConfig(this, conf);
      this.activeVirtuals[typeName + '/' + id] = elem;
    }
  } // addElement()

  /** Activate virtual elements for all configured elements. */
  startup(allConfig: any) {
    Object.entries(allConfig).forEach(([typeName, elements]) => {
      Object.entries(elements as any).forEach(([id, conf]) => {
        this.addElement(typeName, id, conf);
      });
    });
    Object.entries(this.activeVirtuals).forEach(([id, v]) => {
      v.doAction({});
    });
  } // startup()


  queueEvents(events = "", value = "") {
    events.split(',').forEach(ev => {
      ev = ev.replaceAll('$v', value);
      // Logger.trace(`queue: ${ev}`);
      this.events.push(ev);
    })
  }

  executeEvents() {
    if (this.events.length > 0) {
      const ev = this.events.shift();
      if (ev) {
        // ev = reference/temp?reference=19
        const [typeId, args] = ev.split('?');
        const e = this.activeVirtuals[typeId];
        Logger.trace("execute:", e, args);
        if (e) {
          const actions = {} as any;
          args.split('&').forEach(a => {
            const [key, val] = a.split('=');
            actions[key] = val;
          })
          e.doAction(actions);
        }
      }
    }
  }

  // give compute time to all elements by calling the loop function
  loop() {
    Object.entries(this.activeVirtuals).forEach(([id, v]) => {
      v.loop();
    });
  }
  
  /** Process an action for a given element. */
  dispatch(typeId: string, cmd: any) {
    Logger.trace("dispatch", typeId, cmd);
    const e: VirtualBaseElement = this.activeVirtuals[typeId];
    e?.doAction(cmd);
  }

  /** Return the state of a single element. */
  async state(typeId: string) {
    const e: VirtualBaseElement = this.activeVirtuals[typeId];
    if (e) {
      return (e.getState());
    } else {
      return ({});
    }
  } // state()

  /** return the state of all virtual elements */
  async allState() {
    const all: any = {};

    for (const eId in this.activeVirtuals) {
      all[eId] = await this.activeVirtuals[eId].getState();
    }
    return (all);
  } // allState()

}
