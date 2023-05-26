(function () {
  /**
   * A bit of JS to implement a Web Component loaded from file,
   * which would bundle DOM + JS + CSS:
   *   <template> Shadow DOM </template>
   *   <style> CSS </style>
   *   <script> JS </script>
   */
  const parser = new DOMParser();
  async function fetchAndParse(url) {
    const response = await fetch(url);
    const html = await response.text();
    const document = parser.parseFromString( html, 'text/html' );
    const head = document.head;
    const template = head.querySelector( 'template' );
    const style = head.querySelector( 'style' );
    const script = head.querySelector( 'script' );

    return {
      template,
      style,
      script
    };
  }

  function getListeners(settings) {
    return Object.entries(settings).reduce( ( listeners, [ setting, value ] ) => {
      if ( setting.startsWith( 'on' ) ) {
        listeners[setting[2].toLowerCase() + setting.substr(3)] = value;
      }

      return listeners;
    }, {} );
  }

  async function getSettings({ template, style, script }) {
    const jsFile = new Blob([ script.textContent ], { type: 'application/javascript' });
    const jsURL = URL.createObjectURL(jsFile);

    const module = await import(jsURL);
    const listeners = getListeners(module.default);

    return {
      name: module.default.name,
      listeners,
      template,
      style
    };
  }

  function registerComponent({ template, style, name, listeners }) {
    class UnityComponent extends HTMLElement {
      connectedCallback() {
        this._upcast();
        this._attachListeners();
      }

      _upcast() {
        const shadow = this.attachShadow({ mode: 'open' });

        shadow.appendChild(style.cloneNode(true));
        shadow.appendChild(document.importNode(template.content, true));
      }

      _attachListeners() {
        for (const [ event, listener ] of Object.entries(listeners)) {
          this.addEventListener(event, listener, false);
        } 
      }
    }

    return customElements.define(name, UnityComponent);
  }

  const loaded = new Set();
  async function loadComponent(url) {
    if (loaded.has(url)) {
      return;
    }
    loaded.add(url);

    const componentInfo = await fetchAndParse(url);
    const settings = await getSettings(componentInfo);
    registerComponent(settings);
  }

  function loadComponents() {
    for (const link of document.querySelectorAll("link[rel=\"component\"]")) {
      loadComponent(link.href);
    }
  }
  loadComponents();
  if (document.readyState != "interactive" && document.readyState != "loaded") {
    window.addEventListener("DOMContentLoaded", loadComponents);
  }


})();

// Another component to lazily load comments from Mastodon when scrolling to the end of the article
//
// Based on https://carlschwan.eu/2020/12/29/adding-comments-to-your-static-blog-with-mastodon/
(function () {
  function escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  var commentsLoaded = false;

  function toot_active(toot, what) {
    var count = toot[what+'_count'];
    return count > 0 ? 'active' : '';
  }

  function toot_count(toot, what) {
    var count = toot[what+'_count'];
    return count > 0 ? count : '';
  }

  function user_account(account) {
    var result =`@${account.acct}`;
    if (account.acct.indexOf('@') === -1) {
      var domain = new URL(account.url)
      result += `@${domain.hostname}`
    }
    return result;
  }

  function render_toots(toots, in_reply_to, depth) {
    var tootsToRender = toots.filter(toot => toot.in_reply_to_id === in_reply_to);
    tootsToRender.forEach(toot => render_toot(toots, toot, depth));
  }

  function render_toot(toots, toot, depth) {
    toot.account.display_name = escapeHtml(toot.account.display_name);
    toot.account.emojis.forEach(emoji => {
      toot.account.display_name = toot.account.display_name.replace(`:${emoji.shortcode}:`, `<img src="${escapeHtml(emoji.static_url)}" alt="Emoji ${emoji.shortcode}" height="20" width="20" />`);
    });
    mastodonComment =
      `<div class="mastodon-comment" style="margin-left: calc(var(--mastodon-comment-indent) * ${depth})">
        <div class="author">
          <div class="avatar">
            <img src="${escapeHtml(toot.account.avatar_static)}" height=60 width=60 alt="">
          </div>
          <div class="details">
            <a class="name" href="${toot.account.url}" rel="nofollow">${toot.account.display_name}</a>
            <a class="user" href="${toot.account.url}" rel="nofollow">${user_account(toot.account)}</a>
          </div>
          <a class="date" href="${toot.url}" rel="nofollow">${toot.created_at.substr(0, 10)} ${toot.created_at.substr(11, 8)}</a>
        </div>
        <div class="content">${toot.content}</div>
        <div class="status">
          <div class="replies ${toot_active(toot, 'replies')}">
            <a href="${toot.url}" rel="nofollow"><i class="fa fa-reply fa-fw"></i>${toot_count(toot, 'replies')}</a>
          </div>
          <div class="reblogs ${toot_active(toot, 'reblogs')}">
            <a href="${toot.url}" rel="nofollow"><i class="fa fa-retweet fa-fw"></i>${toot_count(toot, 'reblogs')}</a>
          </div>
          <div class="favourites ${toot_active(toot, 'favourites')}">
            <a href="${toot.url}" rel="nofollow"><i class="fa fa-star fa-fw"></i>${toot_count(toot, 'favourites')}</a>
          </div>
        </div>
      </div>`;
      
    const js = document.createElement("script");
    js.setAttribute("integrity", "sha512-uHOKtSfJWScGmyyFr2O2+efpDx2nhwHU2v7MVeptzZoiC7bdF6Ny/CmZhN2AwIK1oCFiVQQ5DA/L9FSzyPNu6Q==");
    js.setAttribute("crossorigin", "anonymous")
    js.setAttribute("referrerpolicy", "no-referrer");
    js.type = "text/javascript";
    js.src = "https://cdnjs.cloudflare.com/ajax/libs/dompurify/2.4.1/purify.min.js"
    document.body.appendChild(js);

    js.onload = () => {
      document.querySelector('section.comments').appendChild(DOMPurify.sanitize(mastodonComment, {'RETURN_DOM_FRAGMENT': true}));
      render_toots(toots, toot.id, depth + 1)
    } 
  }

  function loadComments() {
    if (commentsLoaded) return;

    const domElement = document.querySelector("section.comments");
    const loadingElement = document.createElement("span");
    loadingElement.textContent = "Loading comments from the Fediverse...";
    domElement.appendChild(loadingElement);
    
    const { host, id } = domElement.dataset;

    fetch('https://' + host + '/api/v1/statuses/' + id + '/context')
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        loadingElement.remove();
        if(data['descendants'] && Array.isArray(data['descendants']) && data['descendants'].length > 0) {
          render_toots(data['descendants'], id, 0)
        } else {
          domElement.innerHTML += "<p>No comments found</p>";
        }

        commentsLoaded = true;
      });
  }

  function respondToVisibility(element, callback) {
    var options = {
      root: null,
    };

    var observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.intersectionRatio > 0) {
          callback();
        }
      });
    }, options);

    observer.observe(element);
  }

  window.addEventListener("load", function () {
    const comments = document.querySelector("section.comments");
    respondToVisibility(comments, loadComments);
  }, { once: true });
})();
