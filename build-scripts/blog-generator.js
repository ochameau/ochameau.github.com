/// -------- NODE COMPAT
// $ npm install xmldom node-fetch marked js-yaml
//
// With node 17.5+ we could drop this
import fetch, { Headers } from "node-fetch";
function btoa(str) {
  return Buffer.from(str).toString('base64');
}
import { DOMParser } from "xmldom";
import { marked } from "marked";
import yaml from "js-yaml";
/// -------- NODE COMPAT

// HTML:
// <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
// <script src="https://unpkg.com/js-yaml@4.1.0/dist/js-yaml.min.js"></script>

const DAV_NS = "DAV:";

/**
 * Retrieve the list of absolute path of all files and folders from
 * a given absolute URL.
 *
 * This will use HTTP method "PROPFIND" (part of WebDav),
 * to retrive the list of file within a given folder on a remote HTTP server.
 *
 * As this is part of WebDav, this is frequently gated behind Web Auth,
 * so that a username and password is often required.
 */
async function listFiles({
  url,
  username,
  password,
}) {
  // PROPFIND spec:
  // https://greenbytes.de/tech/webdav/rfc4918.html#rfc.section.9.1

  // Pass the following body in order to slightly reduce the response size
  // and only retrieve the content length.
  // We do not care about sizes, but it avoid passind all the property values
  const body = `<?xml version="1.0" encoding="utf-8" ?>
    <propfind xmlns="DAV:">
      <prop>
        <getcontentlength/>
      </prop>
    </propfind>`;

  /*
    The following allows retrieving all available property names
  const body = `<?xml version="1.0" encoding="utf-8" ?>
    <propfind xmlns="DAV:">
      <propname/>
    </propfind>`;
  */

  const headers = new Headers();
  // Pass depth=1 in order to only retrieve the given directory files
  // (0 which equals to Infinity rarely work/is allowed)
  headers.set("depth", "1");

  // For now, we assume using very basic HTTP Auth method:
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization#basic_authentication
  // But it might be worth supporting more advanced and secure method.
  headers.set("Authorization", "Basic " + btoa(username + ":" + password));

  const response = await fetch(url, {
    method: "PROPFIND",
    headers,
    body,
  });
  console.log("PROFIND", response);

  const text = await response.text();
  console.log("PROPFIND text", text);
  const xml = new DOMParser().parseFromString(text, "text/html");

  // Equivalent of querySelectorAll("response href"):
  const list = xml.getElementsByTagNameNS(DAV_NS, "response");
  const result = [];
  // getElementsByName doesn't return an iterable..
  for(let i = 0; i < list.length; i++) {
    const response = list.item(i);
    const href = response.getElementsByTagNameNS(DAV_NS, "href");
    if (href.length > 0) {
      const filePath = href.item(0).textContent;
      // Ignore folders ending with '/'
      if (!filePath.endsWith("/")) {
        result.push(filePath);
      }
    }
  }
  result.sort();
  return result;
}

async function fetchBlogPostTemplate(sourceBaseUrl) {
  const templateUrl = sourceBaseUrl + "/source/templates/blogpost.html";
  const templateResponse = await fetch(templateUrl, {
    method: "GET",
  });
  return templateResponse.text();
}

async function fetchArchivesTemplate(sourceBaseUrl) {
  const templateUrl = sourceBaseUrl + "/source/templates/archives.html";
  const templateResponse = await fetch(templateUrl, {
    method: "GET",
  });
  return templateResponse.text();
}

async function fetchRSSTemplate(sourceBaseUrl) {
  const templateUrl = sourceBaseUrl + "/source/templates/rss.xml";
  const templateResponse = await fetch(templateUrl, {
    method: "GET",
  });
  return templateResponse.text();
}

// HTTP PUT wouldn't create subfolder automatically,
// so we are using HTTP MKCOL to create each individual sub folder down
// to the file we want to create.
// https://greenbytes.de/tech/webdav/rfc4918.html#METHOD_MKCOL
async function createParentFolders(username, password, sourceBaseUrl, absolutePath) {
  let folderURL = sourceBaseUrl;
  let parts = absolutePath.split("/");
  // Drop the file name
  parts.pop();
  for(let part of parts) {
    folderURL += "/" + part;
    await fetch(folderURL, {
      method: "MKCOL",
      headers: {
        "Authorization": "Basic " + btoa(username + ":" + password),
      },
    });
  }
}

function transposeDate(d) {
  return new Date(d.getTime() + d.getTimezoneOffset() * 60000);
}
function transposeDateBack(d) {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000);
}

async function buildBlogPost({ username, password, template, sourceBaseUrl, markdownFile }) {
  // Retrieve the "base file name", by stripping out the date put as prefix.
  // This is later used to build the URL of the post.
  const fileMatches = markdownFile.match(/\/?\d{4}\-\d{2}\-\d{2}\-(.*)\.(markdown|md)/);
  if (!fileMatches) {
    console.error("Unexpected filename, should be YEAR-MONTH-DATE-TITLE.md, like 2000-12-21-my-title.md, got: ", markdownFile);
    return;
  }
  const basename = fileMatches[1];

  // Fetch the jekyll post file (mix of yaml and markdown)
  const markdownUrl = sourceBaseUrl + markdownFile;

  const response = await fetch(markdownUrl, {
    method: "GET",
  });
  const text = await response.text();

  // Process the "front matter" of jekyll where the file starts
  // with some YAML variable set in header in between "---" strings:
  // ---
  // [...YAML variables set...]
  // ---
  // [...Markdown text of the blogpost...]
  const matches = text.match(/\-\-\-\r?\n(.*?)\-\-\-\r?\n(.*)/s);
  if (!matches) {
    console.error("Unable to find 'front matter' with YAML variables in", markdownFile);
    return;
  }
  const yml = yaml.load(matches[1], { version: '1.1' });
  const html = marked.parse(matches[2], {
    // Allow to get links to headers
    headerIds: true,
  });
  if (yml.hidden) {
    return null;
  }

  // Use this complex snippet instead of toLocaleDateString (or other Date methods)
  // in order to avoid having the week day in the string...
  // When the date includes time (hours:minutes), this is kept as a string.
  // While when it is only a date (year-month-date), this is a Date.
  // So ensure this is always a Date.
  if (!(yml.date instanceof Date)) {
    yml.date = transposeDateBack(new Date(yml.date));
  } else {
    // js-yaml parse string as UTC
    // See https://github.com/nodeca/js-yaml/issues/91
    yml.date = transposeDate(yml.date);
  }
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(yml.date);

  // Compute the absolute path on the remote HTTP server for this blog post
  function pad(number) {
    return String(number).padStart(2, "0");
  }
  const postAbsolutePath = "/post/" + yml.date.getFullYear() + "/" + pad(yml.date.getMonth()+1) + "/" + pad(yml.date.getDate()) + "/"+ basename + "/";

  let postHTML = template;
  postHTML = postHTML.replace(/URL/g, postAbsolutePath);
  postHTML = postHTML.replace(/TITLE/g, yml.title);
  postHTML = postHTML.replace(/DATE_STRING/g, formattedDate);
  postHTML = postHTML.replace(/DATE/g, yml.date.toISOString());
  postHTML = postHTML.replace(/ARTICLE/g, html);

  if (yml["mastodon-comments"]) {
    const match = yml["mastodon-comments"].match(/https:\/\/([^\/]+)\/([^\/]+)\/([^\/]+)/);
    const [mastodonLink, mastodonHost, user, tootId] = match;
    postHTML = postHTML.replace(/MASTODON_LINK/g, mastodonLink);
    postHTML = postHTML.replace(/MASTODON_HOST/g, mastodonHost);
    postHTML = postHTML.replace(/TOOT_ID/g, tootId);
  }
  postHTML = postHTML.replace(/MASTODON_HIDDEN/g, yml["mastodon-comments"] ? "" : ` hidden="true"` );

  /*
  console.log(markdownFile, markdownUrl)
  console.log("TEXT", text);
  console.log("YAML", yml);
  console.log("HTML", html);
  console.log("POST", postHTML);
  */

  await createParentFolders(username, password, sourceBaseUrl, postAbsolutePath);

  const postURL = sourceBaseUrl + postAbsolutePath + "index.html";
  const postResponse = await fetch(postURL, {
    method: "PUT",
    headers: {
      "Content-Type": "text/html",
      "Authorization": "Basic " + btoa(username + ":" + password),
    },
    body: postHTML,
  });
  //console.log(postURL, postResponse);

  return {
    path: postAbsolutePath,
    contentHtml: html,
    completeHtml: postHTML,
    title: yml.title,
    dateString: formattedDate,
    isoDate: yml.date.toISOString(),
    categories: yml.categories,
    year: yml.date.getFullYear(),
  };
}

async function main() {
  // URL to fetch templates and PUT ggenerated files (requires Web Server with PUT credentials)
  const sourceBaseUrl = "http://localhost";

  // Final URL where files will be uploaded
  const remoteBaseUrl = "http://techno-barje.fr";

  const sourcesUrl = sourceBaseUrl + "/source/posts/";

  // HTTP Auth credentials for PUT requests
  const username = "alex";
  const password = "alex";

  let files = await listFiles({
    url: sourcesUrl,
    username,
    password,
  });
  files = files.filter(name => name.endsWith(".md") || name.endsWith(".markdown"));
  if (files.length == 0) {
    throw new Error(`There is no files in ${sourcesUrl}`);
  }

  const blogPostTemplate = await fetchBlogPostTemplate(sourceBaseUrl);
  //console.log("TEMPLATE", blogPostTemplate);

  // Rebuild all the blog posts
  let blogPosts = [];
  for(const markdownFile of files) {
    const blogPost = await buildBlogPost({ username, password, template: blogPostTemplate, sourceBaseUrl, markdownFile  });
    //console.log("blogPost", blogPost);
    if (blogPost) {
      blogPosts.push(blogPost);
    }
  }

  // Sort from more recent to oldest as that's the order for RSS and archives
  blogPosts = blogPosts.sort((a, b) => a.isoDate > b.isoDate ? -1 : 1);
  
  // Publish the last blog post, i.e. the first in the list, as index.html
  const rssResponse = await fetch(sourceBaseUrl + "/index.html", {
    method: "PUT",
    headers: {
      "Content-Type": "application/rss+xml",
      "Authorization": "Basic " + btoa(username + ":" + password),
    },
    body: blogPosts[0].completeHtml,
  });

  // Build the archives page
  await buildArchives(username, password, sourceBaseUrl, blogPosts, "/archives/index.html");

  // Build the main RSS feed
  await buildRSS(username, password, sourceBaseUrl, remoteBaseUrl, blogPosts, "/atom.xml");

  // Compute list of all categories
  const categories = new Set();
  for(const blogPost of blogPosts) {
    for(const categorie of blogPost.categories) {
      categories.add(categorie);
    }
  }

  // Build one RSS feed and archive page per categorie
  for (const categorie of categories) {
    const categorieBlogPosts = blogPosts.filter(({ categories }) => categories.includes(categorie));
    await buildRSS(username, password, sourceBaseUrl, remoteBaseUrl, categorieBlogPosts, `/feed/${categorie}.xml`);
    await buildArchives(username, password, sourceBaseUrl, categorieBlogPosts, `/categories/${categorie}/index.html`);
  }
}

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}
async function buildRSS(username, password, sourceBaseUrl, remoteBaseUrl, blogPosts, rssPath) {
  let entries = ""; 
  // blogPosts is already sorted from more recent to oldest
  for(const blogPost of blogPosts) {
    entries += `
  <entry>
    <title>${blogPost.title}</title>
    <link href="${remoteBaseUrl}${blogPost.path}"/>
    <updated>${blogPost.isoDate}</updated>
    <id>${remoteBaseUrl}${blogPost.path.replace(/\/$/,"")}</id>
    <content type="html">${escapeXml(blogPost.contentHtml)}</content>
  </entry>
`;
  }
  let lastUpdated = blogPosts[0].isoDate;

  await createParentFolders(username, password, sourceBaseUrl, rssPath);

  const sourceRssURL = sourceBaseUrl + rssPath;
  const remoteRssURL = remoteBaseUrl + rssPath;

  const rssTemplate = await fetchRSSTemplate(sourceBaseUrl);
  let xml = rssTemplate;
  xml = xml.replace("RSS_URL", remoteRssURL);
  xml = xml.replace("HOME_URL", remoteBaseUrl);
  xml = xml.replace("UPDATED", lastUpdated);
  xml = xml.replace("ENTRIES", entries);

  //console.log("RSS", xml);

  const rssResponse = await fetch(sourceRssURL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/rss+xml",
      "Authorization": "Basic " + btoa(username + ":" + password),
    },
    body: xml,
  });
}

async function buildArchives(username, password, sourceBaseUrl, blogPosts, archivesPath) {
  let archivesLinksHTML = ""; let lastYear = 0;
  for(const blogPost of blogPosts) {
    if (lastYear != blogPost.year) {
      archivesLinksHTML += `  <h2>${blogPost.year}</h2>\n`;
      lastYear = blogPost.year;
    }
    archivesLinksHTML += buildBlogPostArchiveLink(blogPost);
  }

  const archivesTemplate = await fetchArchivesTemplate(sourceBaseUrl);
  const archivesHTML = archivesTemplate.replace("ARCHIVES", archivesLinksHTML);

  await createParentFolders(username, password, sourceBaseUrl, archivesPath);

  const archivesURL = sourceBaseUrl + archivesPath;
  const archiveResponse = await fetch(archivesURL, {
    method: "PUT",
    headers: {
      "Content-Type": "text/html",
      "Authorization": "Basic " + btoa(username + ":" + password),
    },
    body: archivesHTML,
  });
}

function buildBlogPostArchiveLink({ path, title, dateString, isoDate, categories }) {
  const categoriesHTML = categories.map(categorie => {
    return `<a class='category' href='/categories/${categorie}/'>${categorie}</a>`;
  }).join(", ");
  const footer = categoriesHTML ? 
    `<footer>
      <span class="categories">posted in ${categoriesHTML}</span>
    </footer>` : "";

  return `
  <article>

    <h1><a href="${path}">${title}</a></h1>
    <time datetime="${isoDate}" pubdate>${dateString}</time>
    ${footer}

  </article>`;
}

main();


