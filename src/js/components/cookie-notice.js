import Cookies from "js-cookie";

export default class CookieNotice {
  constructor() {
    this.cookieName = 'cookies';
    this.cookieExpiration = 180; // in days

    this.hiddenClass = 'hidden';

    this.container = document.getElementById('cookieContainer');
    const cta = document.getElementById('cookieClose');

    // If cookie is not set, show the notice
    if (! Cookies.get(this.cookieName)) {
      this.showCookies();
    }
    cta.addEventListener('click', this.hideCookies.bind(this));
  }

  /**
   * Show cookie notice
   */
  showCookies() {
    if (this.container.classList.contains(this.hiddenClass)) {
      this.container.classList.remove(this.hiddenClass);
    }
  }

  /**
   * Hide cookie notice and set the Cookie so it's not shown on page reload
   */
  hideCookies() {
    if (!Cookies.get(this.cookieName)) {
      Cookies.set(this.cookieName, 'false', {
        expires: this.cookieExpiration,
        path: ''
      });
    }

    if (! this.container.classList.contains(this.hiddenClass)) {
      this.container.classList.add(this.hiddenClass);
    }
  }
}
