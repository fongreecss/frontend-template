import CookieNotice from "./components/cookie-notice";
import Navigation from "./components/navigation";
import Parallax from "./components/parallax";
import Slider from "./components/slider";
import InViewport from './components/inviewport';
//scrollspy magic
import Gumshoe from 'gumshoejs';
//this is actually just a wrapper around yt-player
import YoutubePlayer from './components/youtube-player';
//wrapper for tns - tiny slider
import TinySlider from "./components/tiny-slider";

/*
//use this for crossbrowser support. 
//was substituted with html attr loading="lazy"
import lazySizes from 'lazysizes';
*/

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('body').classList.add('dom-ready');
  document.querySelector('html').classList.remove('no-js');
  
  new CookieNotice();
  new Navigation();
  new Parallax();
  new InViewport();
  new Slider('.x-slider__wrapper');
  new Gumshoe('.scrollspy');
  new YoutubePlayer();
  new TinySlider();
  
}, false);