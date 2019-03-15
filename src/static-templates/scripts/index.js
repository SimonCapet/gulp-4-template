"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

require("browser-has-hover");

require("user-tabbing");

require("scripts/modules/add-client-classes");

if (!window.RAC_COMPONENTS_INITIALISED) {
  window.RAC_COMPONENTS_INITIALISED = true;
  initComponents();
}

window.InitialiseComponents = initComponents;

function initComponents() {
  var components = [].slice.call(document.querySelectorAll('[data-component]'));
  components.filter(function (c) {
    return !c.hasAttribute('initialised');
  }).forEach(function (elem) {
    var component = elem.getAttribute('data-component');
    fetch('').then(function () {//return component
    }).catch(function (err) {//console.log error
    }); // switch (component) {
    // 	case 'offer':
    // 		require.ensure([], () => initComponent(require('./components/Offer'), elem, component));
    // 		break;
    // 	case 'modal':
    // 		require.ensure([], () => initComponent(require('./components/Modal'), elem, component));
    // 		break;
    // 	case 'dialog':
    // 		require.ensure([], () => initComponent(require('./components/Dialog'), elem, component));
    // 		break;
    // 	case 'responsive-image':
    // 		require.ensure([], () => initComponent(require('scripts/modules/responsive-images').ResponsiveImage, elem, component));
    // 		break;
    // 	case 'trustpilot-reviews':
    // 		require.ensure([], () => initComponent(require('./components/TrustpilotReviews'), elem, component));
    // 		break;
    // 	case 'faqs':
    // 		require.ensure([], () => initComponent(require('./components/FAQs'), elem, component));
    // 		break;
    // 	case 'site-navigation':
    // 		require.ensure([], () => initComponent(require('./components/SiteNavigation'), elem, component));
    // 		break;
    // 	case 'site-ribbon':
    // 		require.ensure([], () => initComponent(require('./components/SiteRibbon'), elem, component));
    // 		break;
    // 	case 'chat-now':
    // 		require.ensure([], () => initComponent(require('scripts/components/ChatNow'), elem, component));
    // 		break;
    // 	case 'countdown':
    // 		require.ensure([], () => initComponent(require('./components/Countdown'), elem, component));
    // 		break;
    // 	case 'cover-bundles':
    // 		require.ensure([], () => initComponent(require('./components/CoverBundlesCarousel'), elem, component));
    // 		break;
    // 	case 'cover-bundles-sticky':
    // 		require.ensure([], () => initComponent(require('./components/CoverBundlesSticky'), elem, component));
    // 		break;
    // 	case 'sticky-message':
    // 		require.ensure([], () => initComponent(require('./components/StickyMessage'), elem, component));
    // 		break;
    // 	case 'tp-carousel':
    // 		require.ensure([], () => initComponent(require('./components/TPCarousel'), elem, component));
    // 		break;
    // 	case 'blazy':
    // 		require.ensure([], () => initComponent(require('./components/BLazy'), elem, component));
    // 		break;
    // 	case 'bodymovin':
    // 		require.ensure([], () => initComponent(require('./components/Bodymovin'), elem, component));
    // 		break;
    // 	default:
    // 		console.warn(`${component} component not found`);
    // }
  });
}

function initComponent(mod, elem, component) {
  elem.setAttribute('initialised', 'true');

  if (mod && mod.default) {
    return new mod.default(elem);
  } else if (mod) {
    return new mod(elem);
  } else {
    throw new Error(component + " component not found");
  }
}