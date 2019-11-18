import CookieNotice from "./components/cookie-notice";
import Navigation from "./components/navigation";
import Parallax from "./components/parallax";
import Slider from "./components/slider";
import InViewport from './components/inviewport';
import Gumshoe from 'gumshoejs';
//import lazySizes from 'lazysizes';

/** load images that are not in viewport 
 * (they should be marked as they) 
 * after page has completely loaded 
 * */
window.addEventListener('load', ()=> {
  document.querySelectorAll('img[data-src]').forEach((el) => {
     el.src = el.dataset.src;
  });
}, false);

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('body').classList.add('dom-ready');
  document.querySelector('html').classList.remove('no-js');
  new CookieNotice();
  new Navigation();
  new Parallax();
  new InViewport();
  new Slider('.x-slider__wrapper');
  new Gumshoe('.scrollspy');
}, false);