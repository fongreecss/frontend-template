/**
 *
 */
import { tns } from "tiny-slider/src/tiny-slider";
export default class TinySlider {
  constructor() {
    document.querySelectorAll(".tns-slider").forEach(el => {
      var slides = el.dataset.tnsSlides ? el.dataset.tnsSlides * 1 : 1;
      console.log(slides);
      tns({
        container: ".tns-slider",
        autoplay: true,
        autoWidth: true,
        items: slides,
        lazyload: true
      });
    });
  }
}
