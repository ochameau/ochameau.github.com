# blog.techno-barje.fr

Sources of blog.techno-barje.fr.

# Layout

- `www` contains all files to be hosted on blog.techno-barje.fr.

  This includes:

  - Static files, like:
    - the `/images/` folder
    - document.css for the unique CSS file
    - loader.js (unique js, implementing declarative WebComponents and Mastodon comments
    - The declarative WebComponent: blog-article.wc

  - The `source` folder includes all sources files used to generate HTML and RSS files.
    The blog posts markdown sources in `source/posts/` and RSS/HTMl templates in `source/templates/`.

  - the `build-scripts` folder contains a nodejs script to take the source folder as input
    in order to craft the HTML and RSS files, that, over HTTP PUT (instead of local filesystem).

  - `webdac-docker-server` contains a docker file to easily spawn a "HTTP PUT enabled"
    Web server which servers the `www` folder.
    It allows the nodejs build script to read source from http://localhost/source
    and write the generated file to http://localhost/


# Build the HTML and RSS files

## Startup a local WebServer with HTTP PUT support

* cd webdav-docker-server && ./run.sh

## Run the nodejs build script

* cd build-scripts/
* yarn
* node blog-generator.js

HTML and RSS files will be updated in the `www` folder:
index.html, atom.xml files
and feed, archives, post folders.
