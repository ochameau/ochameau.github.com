#!/bin/bash

docker rm -f webdav
docker run --restart=always -d -p 0.0.0.0:80:80 --hostname=webdav --name=webdav -v $(pwd)/../www/:/webdav -v $(pwd)/config/:/config jgeusebroek/webdav
