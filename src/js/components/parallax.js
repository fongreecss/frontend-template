/**
 * ADD html attributes to elements
 * All data attributes:
 * data-min - parallax minimum transformY value
 * data-max - parallax maximum transfromY value 
 * data-speed - parallax speed that also determines direction
 * data-is-svg - specify if we are transforming element inside svg. 
 */
export default class Parallax {
  constructor() {
    this.parallaxEls = document.querySelectorAll("[data-speed]");

    window.addEventListener("scroll", this.scrollHandler.bind(this), {
      passive: true,
      capture: true, 
    });
  }

  limitedNumber(number, min, max) {
    if(number <= min) {
      return min;
    } else if(number >= max) {
      return max;
    } 
    return number;
  }

  scrollHandler() {
    for (const parallaxEl of this.parallaxEls) {
      const isSvg = ("undefined" == typeof parallaxEl.dataset.isSvg) ? 0 : 1;
      const min = ("undefined" == typeof parallaxEl.dataset.min) ? '-999999' : +parallaxEl.dataset.min;
      const max = ("undefined" == typeof parallaxEl.dataset.max) ? '999999' : +parallaxEl.dataset.max;
      let transformY = window.pageYOffset * parallaxEl.dataset.speed;
      transformY = this.limitedNumber(transformY, min, max);

      if(!isSvg) {
        parallaxEl.style.transform = `translate3d(0,${transformY}px,0)`;
      } else {
        parallaxEl.setAttribute('y', `${transformY}px`);
      }
    }

  }
  
}
