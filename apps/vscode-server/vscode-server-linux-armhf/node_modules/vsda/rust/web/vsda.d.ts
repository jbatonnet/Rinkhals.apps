/* tslint:disable */
/* eslint-disable */
/**
* Creates a salted message to use as a basis for signing/verification.
* @param {string} original
* @returns {string}
*/
export function createNewMessage(original: string): string;
/**
* Signs a salted message return from create_new_message.
* @param {string} salted_message
* @returns {string}
*/
export function sign(salted_message: string): string;
/**
* Validates the signature for the given original message.
* @param {string} original_message
* @param {string} signature
* @returns {boolean}
*/
export function validate(original_message: string, signature: string): boolean;
/**
* Compatibility for histoic vsda interface
*/
export class signer {
  free(): void;
/**
*/
  constructor();
/**
* @param {string} salted_message
* @returns {string}
*/
  sign(salted_message: string): string;
}
/**
* Compatibility for histoic vsda interface
*/
export class validator {
  free(): void;
/**
*/
  constructor();
/**
* @param {string} original
* @returns {string}
*/
  createNewMessage(original: string): string;
/**
* @param {string} signed_message
* @returns {string}
*/
  validate(signed_message: string): string;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly createNewMessage: (a: number, b: number, c: number) => void;
  readonly sign: (a: number, b: number, c: number) => void;
  readonly validate: (a: number, b: number, c: number, d: number) => number;
  readonly __wbg_signer_free: (a: number) => void;
  readonly signer_new: () => number;
  readonly signer_sign: (a: number, b: number, c: number, d: number) => void;
  readonly __wbg_validator_free: (a: number) => void;
  readonly validator_new: () => number;
  readonly validator_createNewMessage: (a: number, b: number, c: number, d: number) => void;
  readonly validator_validate: (a: number, b: number, c: number, d: number) => void;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_malloc: (a: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number) => number;
  readonly __wbindgen_free: (a: number, b: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
