// Registry.ts

import { VirtualBaseElement } from "./VirtualBaseElement";

export class RegistryClass {

  // type RegistryEntry = {};

  /** all known / registered Virtual Element implementations */
  private registry: { [x: string]: typeof VirtualBaseElement; } = {};

  registerType(type: string, imp: typeof VirtualBaseElement) {
    this.registry[type] = imp;
  }

  newElement(typeName: string, id: string): VirtualBaseElement | undefined {
    const eType = this.registry[typeName];
    if (!eType) {
      console.error(`unknown type ${typeName}`);
      return (undefined);
    } else {
      const c = new eType(typeName, id);
      return (c);
    }
  } // newElement()

}
