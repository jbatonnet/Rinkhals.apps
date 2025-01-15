var vsda_web = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var vsda_exports = {};
  __export(vsda_exports, {
    createNewMessage: () => createNewMessage,
    default: () => vsda_default,
    initSync: () => initSync,
    sign: () => sign,
    signer: () => signer,
    validate: () => validate,
    validator: () => validator
  });
  const import_meta = {};
  let wasm;
  const heap = new Array(32).fill(void 0);
  heap.push(void 0, null, true, false);
  function getObject(idx) {
    return heap[idx];
  }
  let heap_next = heap.length;
  function addHeapObject(obj) {
    if (heap_next === heap.length)
      heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];
    heap[idx] = obj;
    return idx;
  }
  function dropObject(idx) {
    if (idx < 36)
      return;
    heap[idx] = heap_next;
    heap_next = idx;
  }
  function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
  }
  const cachedTextDecoder = new TextDecoder("utf-8", { ignoreBOM: true, fatal: true });
  cachedTextDecoder.decode();
  let cachedUint8Memory0 = new Uint8Array();
  function getUint8Memory0() {
    if (cachedUint8Memory0.byteLength === 0) {
      cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
  }
  function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
  }
  let WASM_VECTOR_LEN = 0;
  const cachedTextEncoder = new TextEncoder("utf-8");
  const encodeString = typeof cachedTextEncoder.encodeInto === "function" ? function(arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
  } : function(arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
      read: arg.length,
      written: buf.length
    };
  };
  function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === void 0) {
      const buf = cachedTextEncoder.encode(arg);
      const ptr2 = malloc(buf.length);
      getUint8Memory0().subarray(ptr2, ptr2 + buf.length).set(buf);
      WASM_VECTOR_LEN = buf.length;
      return ptr2;
    }
    let len = arg.length;
    let ptr = malloc(len);
    const mem = getUint8Memory0();
    let offset = 0;
    for (; offset < len; offset++) {
      const code = arg.charCodeAt(offset);
      if (code > 127)
        break;
      mem[ptr + offset] = code;
    }
    if (offset !== len) {
      if (offset !== 0) {
        arg = arg.slice(offset);
      }
      ptr = realloc(ptr, len, len = offset + arg.length * 3);
      const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
      const ret = encodeString(arg, view);
      offset += ret.written;
    }
    WASM_VECTOR_LEN = offset;
    return ptr;
  }
  let cachedInt32Memory0 = new Int32Array();
  function getInt32Memory0() {
    if (cachedInt32Memory0.byteLength === 0) {
      cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32Memory0;
  }
  function createNewMessage(original) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(original, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      const len0 = WASM_VECTOR_LEN;
      wasm.createNewMessage(retptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(r0, r1);
    }
  }
  function sign(salted_message) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(salted_message, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      const len0 = WASM_VECTOR_LEN;
      wasm.sign(retptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(r0, r1);
    }
  }
  function validate(original_message, signature) {
    const ptr0 = passStringToWasm0(original_message, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(signature, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.validate(ptr0, len0, ptr1, len1);
    return ret !== 0;
  }
  function handleError(f, args) {
    try {
      return f.apply(this, args);
    } catch (e) {
      wasm.__wbindgen_exn_store(addHeapObject(e));
    }
  }
  function getArrayU8FromWasm0(ptr, len) {
    return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
  }
  const signerFinalization = new FinalizationRegistry((ptr) => wasm.__wbg_signer_free(ptr));
  class signer {
    static __wrap(ptr) {
      const obj = Object.create(signer.prototype);
      obj.ptr = ptr;
      signerFinalization.register(obj, obj.ptr, obj);
      return obj;
    }
    __destroy_into_raw() {
      const ptr = this.ptr;
      this.ptr = 0;
      signerFinalization.unregister(this);
      return ptr;
    }
    free() {
      const ptr = this.__destroy_into_raw();
      wasm.__wbg_signer_free(ptr);
    }
    /**
    */
    constructor() {
      const ret = wasm.signer_new();
      return signer.__wrap(ret);
    }
    /**
    * @param {string} salted_message
    * @returns {string}
    */
    sign(salted_message) {
      try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(salted_message, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.signer_sign(retptr, this.ptr, ptr0, len0);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        return getStringFromWasm0(r0, r1);
      } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        wasm.__wbindgen_free(r0, r1);
      }
    }
  }
  const validatorFinalization = new FinalizationRegistry((ptr) => wasm.__wbg_validator_free(ptr));
  class validator {
    static __wrap(ptr) {
      const obj = Object.create(validator.prototype);
      obj.ptr = ptr;
      validatorFinalization.register(obj, obj.ptr, obj);
      return obj;
    }
    __destroy_into_raw() {
      const ptr = this.ptr;
      this.ptr = 0;
      validatorFinalization.unregister(this);
      return ptr;
    }
    free() {
      const ptr = this.__destroy_into_raw();
      wasm.__wbg_validator_free(ptr);
    }
    /**
    */
    constructor() {
      const ret = wasm.validator_new();
      return validator.__wrap(ret);
    }
    /**
    * @param {string} original
    * @returns {string}
    */
    createNewMessage(original) {
      try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(original, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.validator_createNewMessage(retptr, this.ptr, ptr0, len0);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        return getStringFromWasm0(r0, r1);
      } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        wasm.__wbindgen_free(r0, r1);
      }
    }
    /**
    * @param {string} signed_message
    * @returns {string}
    */
    validate(signed_message) {
      try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(signed_message, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.validator_validate(retptr, this.ptr, ptr0, len0);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        return getStringFromWasm0(r0, r1);
      } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        wasm.__wbindgen_free(r0, r1);
      }
    }
  }
  async function load(module2, imports) {
    if (typeof Response === "function" && module2 instanceof Response) {
      if (typeof WebAssembly.instantiateStreaming === "function") {
        try {
          return await WebAssembly.instantiateStreaming(module2, imports);
        } catch (e) {
          if (module2.headers.get("Content-Type") != "application/wasm") {
            console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);
          } else {
            throw e;
          }
        }
      }
      const bytes = await module2.arrayBuffer();
      return await WebAssembly.instantiate(bytes, imports);
    } else {
      const instance = await WebAssembly.instantiate(module2, imports);
      if (instance instanceof WebAssembly.Instance) {
        return { instance, module: module2 };
      } else {
        return instance;
      }
    }
  }
  function getImports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbindgen_object_clone_ref = function(arg0) {
      const ret = getObject(arg0);
      return addHeapObject(ret);
    };
    imports.wbg.__wbg_crypto_e1d53a1d73fb10b8 = function(arg0) {
      const ret = getObject(arg0).crypto;
      return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_is_object = function(arg0) {
      const val = getObject(arg0);
      const ret = typeof val === "object" && val !== null;
      return ret;
    };
    imports.wbg.__wbg_process_038c26bf42b093f8 = function(arg0) {
      const ret = getObject(arg0).process;
      return addHeapObject(ret);
    };
    imports.wbg.__wbg_versions_ab37218d2f0b24a8 = function(arg0) {
      const ret = getObject(arg0).versions;
      return addHeapObject(ret);
    };
    imports.wbg.__wbg_node_080f4b19d15bc1fe = function(arg0) {
      const ret = getObject(arg0).node;
      return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_is_string = function(arg0) {
      const ret = typeof getObject(arg0) === "string";
      return ret;
    };
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
      takeObject(arg0);
    };
    imports.wbg.__wbg_msCrypto_6e7d3e1f92610cbb = function(arg0) {
      const ret = getObject(arg0).msCrypto;
      return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithlength_f5933855e4f48a19 = function(arg0) {
      const ret = new Uint8Array(arg0 >>> 0);
      return addHeapObject(ret);
    };
    imports.wbg.__wbg_require_78a3dcfbdba9cbce = function() {
      return handleError(function() {
        const ret = module.require;
        return addHeapObject(ret);
      }, arguments);
    };
    imports.wbg.__wbindgen_is_function = function(arg0) {
      const ret = typeof getObject(arg0) === "function";
      return ret;
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
      const ret = getStringFromWasm0(arg0, arg1);
      return addHeapObject(ret);
    };
    imports.wbg.__wbg_call_168da88779e35f61 = function() {
      return handleError(function(arg0, arg1, arg2) {
        const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
      }, arguments);
    };
    imports.wbg.__wbg_self_6d479506f72c6a71 = function() {
      return handleError(function() {
        const ret = self.self;
        return addHeapObject(ret);
      }, arguments);
    };
    imports.wbg.__wbg_window_f2557cc78490aceb = function() {
      return handleError(function() {
        const ret = window.window;
        return addHeapObject(ret);
      }, arguments);
    };
    imports.wbg.__wbg_globalThis_7f206bda628d5286 = function() {
      return handleError(function() {
        const ret = globalThis.globalThis;
        return addHeapObject(ret);
      }, arguments);
    };
    imports.wbg.__wbg_global_ba75c50d1cf384f4 = function() {
      return handleError(function() {
        const ret = global.global;
        return addHeapObject(ret);
      }, arguments);
    };
    imports.wbg.__wbindgen_is_undefined = function(arg0) {
      const ret = getObject(arg0) === void 0;
      return ret;
    };
    imports.wbg.__wbg_newnoargs_b5b063fc6c2f0376 = function(arg0, arg1) {
      const ret = new Function(getStringFromWasm0(arg0, arg1));
      return addHeapObject(ret);
    };
    imports.wbg.__wbg_call_97ae9d8645dc388b = function() {
      return handleError(function(arg0, arg1) {
        const ret = getObject(arg0).call(getObject(arg1));
        return addHeapObject(ret);
      }, arguments);
    };
    imports.wbg.__wbg_randomFillSync_6894564c2c334c42 = function() {
      return handleError(function(arg0, arg1, arg2) {
        getObject(arg0).randomFillSync(getArrayU8FromWasm0(arg1, arg2));
      }, arguments);
    };
    imports.wbg.__wbg_subarray_58ad4efbb5bcb886 = function(arg0, arg1, arg2) {
      const ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
      return addHeapObject(ret);
    };
    imports.wbg.__wbg_getRandomValues_805f1c3d65988a5a = function() {
      return handleError(function(arg0, arg1) {
        getObject(arg0).getRandomValues(getObject(arg1));
      }, arguments);
    };
    imports.wbg.__wbg_length_9e1ae1900cb0fbd5 = function(arg0) {
      const ret = getObject(arg0).length;
      return ret;
    };
    imports.wbg.__wbindgen_memory = function() {
      const ret = wasm.memory;
      return addHeapObject(ret);
    };
    imports.wbg.__wbg_buffer_3f3d764d4747d564 = function(arg0) {
      const ret = getObject(arg0).buffer;
      return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_8c3f0052272a457a = function(arg0) {
      const ret = new Uint8Array(getObject(arg0));
      return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_83db9690f9353e79 = function(arg0, arg1, arg2) {
      getObject(arg0).set(getObject(arg1), arg2 >>> 0);
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
      throw new Error(getStringFromWasm0(arg0, arg1));
    };
    return imports;
  }
  function initMemory(imports, maybe_memory) {
  }
  function finalizeInit(instance, module2) {
    wasm = instance.exports;
    init.__wbindgen_wasm_module = module2;
    cachedInt32Memory0 = new Int32Array();
    cachedUint8Memory0 = new Uint8Array();
    return wasm;
  }
  function initSync(module2) {
    const imports = getImports();
    initMemory(imports);
    if (!(module2 instanceof WebAssembly.Module)) {
      module2 = new WebAssembly.Module(module2);
    }
    const instance = new WebAssembly.Instance(module2, imports);
    return finalizeInit(instance, module2);
  }
  async function init(input) {
    if (typeof input === "undefined") {
      input = new URL("vsda_bg.wasm", import_meta.url);
    }
    const imports = getImports();
    if (typeof input === "string" || typeof Request === "function" && input instanceof Request || typeof URL === "function" && input instanceof URL) {
      input = fetch(input);
    }
    initMemory(imports);
    const { instance, module: module2 } = await load(await input, imports);
    return finalizeInit(instance, module2);
  }
  var vsda_default = init;
  return __toCommonJS(vsda_exports);
})();
