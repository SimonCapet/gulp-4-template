// This must be included for require.ensure to work on IE
import 'core-js/fn/promise';

if (!(<any>Object).assign) {
	require.ensure([], () => {
		require('core-js/fn/object/assign');
		console.log('Object#assign polyfill loaded');
	});
}

if (!String.prototype.includes) {
	require.ensure([], () => {
		require('core-js/modules/es6.string.includes.js');
		console.log('String#includes polyfill loaded');
	});
}

if (!(<any>Array).prototype.includes) {
	require.ensure([], () => {
		require('core-js/modules/es7.array.includes.js');
		console.log('Array#includes polyfill loaded');
	});
}

if (!(<any>Array).prototype.find) {
	require.ensure([], () => {
		require('core-js/modules/es6.array.find.js');
		console.log('Array#find polyfill loaded');
	});
}

if ((<any>window).Element && !Element.prototype.closest) {
	require.ensure([], () => {
		require('./element.closest');
		console.log('Element#closest polyfill loaded');
	});
}

if ((<any>window).Element && !Element.prototype.remove) {
	require.ensure([], () => {
		require('./ChildNode.prototype.remove');
		console.log('ChildNode#remove polyfill loaded');
	});
}

if (!String.prototype.padStart) {
	require.ensure([], () => {
		require('core-js/modules/es7.string.pad-start.js');
		console.log('String#padStart polyfill loaded');
	});
}

if (!String.prototype.padEnd) {
	require.ensure([], () => {
		require('core-js/modules/es7.string.pad-end.js');
		console.log('String#padEnd polyfill loaded');
	});
}
