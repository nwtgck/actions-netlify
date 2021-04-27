/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 417:
/***/ ((module) => {

module.exports = require("crypto");;

/***/ }),

/***/ 747:
/***/ ((module) => {

module.exports = require("fs");;

/***/ }),

/***/ 13:
/***/ ((module) => {

module.exports = require("worker_threads");;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {

const fs = __nccwpck_require__(747);
const crypto = __nccwpck_require__(417);
const {parentPort} = __nccwpck_require__(13);

const handlers = {
	hashFile: (algorithm, filePath) => new Promise((resolve, reject) => {
		const hasher = crypto.createHash(algorithm);
		fs.createReadStream(filePath)
			// TODO: Use `Stream.pipeline` when targeting Node.js 12.
			.on('error', reject)
			.pipe(hasher)
			.on('error', reject)
			.on('finish', () => {
				const {buffer} = new Uint8Array(hasher.read());
				resolve({value: buffer, transferList: [buffer]});
			});
	}),
	hash: async (algorithm, input) => {
		const hasher = crypto.createHash(algorithm);

		if (Array.isArray(input)) {
			for (const part of input) {
				hasher.update(part);
			}
		} else {
			hasher.update(input);
		}

		const {buffer} = new Uint8Array(hasher.digest());
		return {value: buffer, transferList: [buffer]};
	}
};

parentPort.on('message', async message => {
	try {
		const {method, args} = message;
		const handler = handlers[method];

		if (handler === undefined) {
			throw new Error(`Unknown method '${method}'`);
		}

		const {value, transferList} = await handler(...args);
		parentPort.postMessage({id: message.id, value}, transferList);
	} catch (error) {
		const newError = {message: error.message, stack: error.stack};

		for (const [key, value] of Object.entries(error)) {
			if (typeof value !== 'object') {
				newError[key] = value;
			}
		}

		parentPort.postMessage({id: message.id, error: newError});
	}
});

})();

module.exports = __webpack_exports__;
/******/ })()
;