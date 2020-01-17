
/**
 * 
 */
import YTPlayer from 'yt-player';
export default class YoutubePlayer {
    constructor(selector) {
        selector = ("string" == typeof selector) ? selector : '[data-yt-video]';
        document.querySelectorAll(selector).forEach(function(el) {
            console.log(el.dataset.ytVideo);
            let player = new YTPlayer( '#' + el.id, {
              controls: 1,
              info: 0,
              related: 0,
              annotations: 0,
              captions: 0,
              modestBranding: 1,
              playerVars: {
                rel: 0,
                showinfo: 0,
                ecver: 2
              }
            });
            player.load(el.dataset.ytVideo);
          });
    }
  }