
Easily spawn a WebDav HTTP server for local testing.

$ ./run.sh

See lighttp logs:
$ docker logs webdav

This use docker images from:
https://github.com/jgeusebroek/docker-webdav

See lighttpd config file in config/webdav.conf.

Default username and password for HTTP Auth is alex:alex

This can be changed by modifying config/htpasswd.

You might use http://aspirine.org/htpasswd_en.html
if you don't want to install the htpasswd command.
