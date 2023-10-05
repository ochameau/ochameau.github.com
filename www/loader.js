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

  function emojify(input, emojis) {
      let output = input;

      emojis.forEach(emoji => {
        let picture = document.createElement("picture");

        let source = document.createElement("source");
        source.setAttribute("srcset", escapeHtml(emoji.url));
        source.setAttribute("media", "(prefers-reduced-motion: no-preference)");

        let img = document.createElement("img");
        img.className = "emoji";
        img.setAttribute("src", escapeHtml(emoji.static_url));
        img.setAttribute("alt", `:${ emoji.shortcode }:`);
        img.setAttribute("title", `:${ emoji.shortcode }:`);
        img.setAttribute("width", "20");
        img.setAttribute("height", "20");

        picture.appendChild(source);
        picture.appendChild(img);

        output = output.replace(`:${ emoji.shortcode }:`, picture.outerHTML);
      });

      return output;
    }

    function loadComments() {
      let commentsWrapper = document.querySelector("section.comments");
      const loadingElement = document.createElement("span");
      loadingElement.textContent = "Loading comments from the Fediverse...";
      commentsWrapper.appendChild(loadingElement);

      const { host, id } = commentsWrapper.dataset;

      fetch('https://' + host + '/api/v1/statuses/' + id + '/context')
        .then(function(response) {
          return response.json();
        })
        .then(function(data) {
          loadingElement.remove();
          let descendants = data['descendants'];
          if(
            descendants &&
            Array.isArray(descendants) &&
            descendants.length > 0
          ) {
            commentsWrapper.innerHTML = "";

            descendants.forEach(function(status) {
                console.log(descendants)
              if( status.account.display_name.length > 0 ) {
                status.account.display_name = escapeHtml(status.account.display_name);
                status.account.display_name = emojify(status.account.display_name, status.account.emojis);
              } else {
                status.account.display_name = status.account.username;
              };

              let instance = "";
              if( status.account.acct.includes("@") ) {
                instance = status.account.acct.split("@")[1];
              } else {
                instance = "{{ .host }}";
              }

              const isReply = status.in_reply_to_id !== "{{ .id }}";

              let op = false;
              if( status.account.acct == "{{ .username }}" ) {
                op = true;
              }

              status.content = emojify(status.content, status.emojis);

              let avatarSource = document.createElement("source");
              avatarSource.setAttribute("srcset", escapeHtml(status.account.avatar));
              avatarSource.setAttribute("media", "(prefers-reduced-motion: no-preference)");

              let avatarImg = document.createElement("img");
              avatarImg.className = "avatar";
              avatarImg.setAttribute("src", escapeHtml(status.account.avatar_static));
              avatarImg.setAttribute("alt", `@${ status.account.username }@${ instance } avatar`);

              let avatarPicture = document.createElement("picture");
              avatarPicture.appendChild(avatarSource);
              avatarPicture.appendChild(avatarImg);

              let avatar = document.createElement("a");
              avatar.className = "avatar-link";
              avatar.setAttribute("href", status.account.url);
              avatar.setAttribute("rel", "external nofollow");
              avatar.setAttribute("title", `View profile at @${ status.account.username }@${ instance }`);
              avatar.appendChild(avatarPicture);

              let instanceBadge = document.createElement("a");
              instanceBadge.className = "instance";
              instanceBadge.setAttribute("href", status.account.url);
              instanceBadge.setAttribute("title", `@${ status.account.username }@${ instance }`);
              instanceBadge.setAttribute("rel", "external nofollow");
              instanceBadge.textContent = instance;

              let display = document.createElement("span");
              display.className = "display";
              display.setAttribute("itemprop", "author");
              display.setAttribute("itemtype", "http://schema.org/Person");
              display.innerHTML = status.account.display_name;

              let header = document.createElement("header");
              header.className = "author";
              header.appendChild(display);
              header.appendChild(instanceBadge);

              let permalink = document.createElement("a");
              permalink.setAttribute("href", status.url);
              permalink.setAttribute("itemprop", "url");
              permalink.setAttribute("title", `View comment at ${ instance }`);
              permalink.setAttribute("rel", "external nofollow");
              permalink.textContent = new Date( status.created_at ).toLocaleString('en-US', {
                dateStyle: "long",
                timeStyle: "short",
              });

              let timestamp = document.createElement("time");
              timestamp.setAttribute("datetime", status.created_at);
              timestamp.appendChild(permalink);

              let main = document.createElement("main");
              main.setAttribute("itemprop", "text");
              main.innerHTML = status.content;

              let interactions = document.createElement("footer");
              if(status.favourites_count > 0) {
                let faves = document.createElement("a");
                faves.className = "faves";
                faves.setAttribute("href", `${ status.url }/favourites`);
                faves.setAttribute("title", `Favorites from ${ instance }`);
                faves.textContent = status.favourites_count;

                interactions.appendChild(faves);
              }

              let comment = document.createElement("article");
              comment.id = `comment-${ status.id }`;
              comment.className = isReply ? "comment comment-reply" : "comment";
              comment.setAttribute("itemprop", "comment");
              comment.setAttribute("itemtype", "http://schema.org/Comment");
              comment.appendChild(avatar);
              comment.appendChild(header);
              comment.appendChild(timestamp);
              comment.appendChild(main);
              comment.appendChild(interactions);

              if(op === true) {
                comment.classList.add("op");

                avatar.classList.add("op");
                avatar.setAttribute(
                  "title",
                  "Blog post author; " + avatar.getAttribute("title")
                );

                instanceBadge.classList.add("op");
                instanceBadge.setAttribute(
                  "title",
                  "Blog post author: " + instanceBadge.getAttribute("title")
                );
              }

              const js = document.createElement("script");
              js.setAttribute("integrity", "sha512-uHOKtSfJWScGmyyFr2O2+efpDx2nhwHU2v7MVeptzZoiC7bdF6Ny/CmZhN2AwIK1oCFiVQQ5DA/L9FSzyPNu6Q==");
              js.setAttribute("crossorigin", "anonymous")
              js.setAttribute("referrerpolicy", "no-referrer");
              js.type = "text/javascript";
              js.src = "https://cdnjs.cloudflare.com/ajax/libs/dompurify/2.4.1/purify.min.js"
              document.body.appendChild(js);
              js.onload = () => {
                commentsWrapper.innerHTML += DOMPurify.sanitize(comment.outerHTML);
              }
            });
          }
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
