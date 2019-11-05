export default class Slider {
  constructor(sliderWrapper) {
    // wrapper, so it can handle multiple on the same page
    this.sliderWrapper = document.querySelector(sliderWrapper);

    if (! this.sliderWrapper) return;

    // prev next buttons
    this.prev = this.sliderWrapper.querySelector('.x-slider__prev');
    this.next = this.sliderWrapper.querySelector('.x-slider__next');

    // the element with horizontal scroll
    this.slider = this.sliderWrapper.querySelector('.x-slider');
    this.pagination = this.sliderWrapper.querySelector('.x-slider__indicator');

    this.slides = 0;
    this.current = 1;

    this.setup();
    this.attachListeners();
  }

  setup() {
    // Run this if slider is visible/displayed
    if (this.slider.offsetParent !== null) {
      this.slides = this.getTotalSlides();
      this.calculateCurrent(this.slider.scrollLeft);
    }
  }

  attachListeners() {

    // It needs to recalcualte the number of total slides on resize
    window.addEventListener('resize', () => {
      this.setup();
    }, {
      passive: true
    });

    this.slider.addEventListener('scroll', () => {
      this.calculateCurrent(this.slider.scrollLeft);

      this.prev.classList.remove('js-disabled');
      this.next.classList.remove('js-disabled');

      // if first disable prev
      if (this.current === 1) {
        this.prev.classList.add('js-disabled');
      }

      if (this.current === this.slides) {
        this.next.classList.add('js-disabled');
      }
    }, {
      passive: true
    });

    if (this.prev) {
      this.prev.addEventListener('click', () => {
        this.slider.scrollLeft = this.slider.scrollLeft - this.slider.clientWidth;
      });
    }

    if (this.next) {
      this.next.addEventListener('click', () => {
        this.slider.scrollLeft = this.slider.scrollLeft + this.slider.clientWidth;
      });
    }
  }

  /**
   * Returns the current slide and
   * changes the text of the pagiantion to 'current slide / total slides'
   */
  calculateCurrent(scrollLeft) {
    this.current = Math.round(scrollLeft / (this.slider.clientWidth * 0.9)) + 1;

    if (this.pagination) {
      this.pagination.textContent = this.current + "/" + this.slides;
    }
  }

  /**
   * Returns the number of total slides
   */
  getTotalSlides() {
    // 0.9 is used so it calculates the card correctly on mobile (card width is 90vw)
    // It makes no difference on desktop, due to rounding
    return Math.round(this.slider.scrollWidth / (this.slider.clientWidth * 0.9));
  }
}
