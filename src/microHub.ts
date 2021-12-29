// file: microHub.ts
// Central information broker with memory.

/// <reference path="JsonParse.ts" />

interface HubEntry {
  id: number;
  match: RegExp;
  callback: JsonParseCallback;
}

interface HubEntryList {
  [s: number]: HubEntry;
}

/**
 *
 */
class MicroHub {
  private _registrations: HubEntryList = {};
  private _registrationsId = 0;
  private _store: object = {};

  read(path: string): any {
    const o: any = this._findStoreObject(this.pPath(path));
    return o[this.pKey(path)];
  }

  write(path: string, value: any) {
    const o: any = this._findStoreObject(this.pPath(path));
    o[this.pKey(path)] = value;
  }

  /**
   * Subscribe to changes in the store using a path expression
   * @param {string} matchPath expression for the registration
   * @param {JsonParseCallback} fCallback
   * @param {boolean} replay
   * @returns {number} number of registration
   */
  subscribe(matchPath: string, fCallback: JsonParseCallback, replay = false): number {
    const h = this._registrationsId;

    // treating upper/lowercase equal is not clearly defined, but true with domain names.
    const rn = matchPath.toLocaleLowerCase();

    // build a regexp pattern that will match the event names
    const re = '^' + rn
      .replace(/(\[|\]|\/|\?)/g, '\\$1')
      .replace(/\*\*/g, '\\S{0,}')
      .replace(/\*/g, '[^/?]*') +
      '$';

    const newEntry: HubEntry = {
      id: h,
      match: RegExp(re),
      callback: fCallback
    };
    this._registrations[h] = newEntry;

    this._registrationsId++;

    if (replay) {
      jsonParse(
        this._store,
        function (path: string, key: string | null, value: string | null) {
          let fullPath: string = path + (key ? '?' + key : '');
          if (fullPath) {
            fullPath = fullPath.toLocaleLowerCase();
            if (fullPath.match(newEntry.match)) { newEntry.callback(path, key ? key.toLowerCase() : null, value); }
          } // if
        }.bind(this)
      );
    }

    return h;
  } // subscribe

  /**
   * Cancel a subscription.
   * @param h subscription registration id.
   */
  unsubscribe(h: number) {
    delete this._registrations[h];
  } // unsubscribe

  /**
   * Replay the store data for a specific registration.
   * @param h subscription registration id.
   */
  replay(h: number) {
    const e: HubEntry = this._registrations[h];

    if (e) {
      jsonParse(
        this._store,
        function (path: string, key: string | null, value: string | null) {
          let fullPath: string = path + (key ? '?' + key : '');
          if (fullPath) {
            fullPath = fullPath.toLocaleLowerCase();
            if (fullPath.match(e.match)) { e.callback(path, key ? key.toLowerCase() : null, value); }
          } // if
        }.bind(this)
      );
    }
  } // replay

  /**
   * Publish new structured data from an object.
   * @param obj
   */
  publishObj(obj: any) {
    jsonParse(
      obj,
      function (this: MicroHub, path: string, key: string | null, value: string | null) {
        this.publishValue(path, key ? key.toLowerCase() : '', value ? value : '');
      }.bind(this)
    );
  } // publishObj()

  /**
   * Publish a single value using.
   * @param path Path of the value
   * @param key Key of the property
   * @param value Value of the property.
   */
  publishValue(path: string, key: string, value: string) {
    let fullPath: string = path + (key ? '?' + key : '');

    if (fullPath) {
      if (key) {
        // save to store
        const p: any = this._findStoreObject(path);
        p[key] = value;
      } // if

      fullPath = fullPath.toLocaleLowerCase();

      Object.values(this._registrations).forEach(r => {
        if (fullPath.match(r.match)) { r.callback(path, key, value); }
      });
    } // if
  } // publish

  onunload() {
    Object.getOwnPropertyNames(this._registrations).forEach(n => delete this._registrations[n as any]);
  } // onunload

  protected _findStoreObject(path: string): any {
    let p: any = this._store;
    if (path[0] === '/') {
      path = path.substring(1);
    }
    const steps = path.split('/');

    // use existing objects.
    while (steps.length > 0 && p[steps[0]]) {
      p = p[steps[0]];
      steps.shift();
    } // while

    // create new objects.
    while (steps.length > 0 && steps[0]) {
      p = p[steps[0]] = {};
      steps.shift();
    } // while
    return p;
  } // _findStoreObject

  // return path to parent object
  private pPath(path: string): string {
    if (path[0] === '/') {
      path = path.substring(1);
    }
    const steps = path.split('/');
    const res = steps.slice(0, steps.length - 1).join('/');
    return res;
  } // pPath

  // return key in parent object
  private pKey(path: string): string {
    const steps = path.split('/');
    const res = steps[steps.length - 1];
    return res;
  }
} // MicroEvents class

const hub = new MicroHub();
window.addEventListener('unload', hub.onunload.bind(hub), false);

// End.
