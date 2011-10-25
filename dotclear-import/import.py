import re
import os

from httplib import HTTP, HTTPConnection
from urlparse import urlparse

def checkURL(url):
  p = urlparse(url)
  conn = HTTPConnection(p[1])
  conn.request('HEAD', p[2])
  response = conn.getresponse()
  conn.close()
  return response.status

""" 
  p = urlparse(url)
  print p[1], p[2]
  h = HTTP(p[1])
  h.putrequest('GET', p[2])
  h.endheaders()
  return h.getreply()[0]
"""

categoriesMap = {
"45328":"web-apis",
"44812":"iphone-sdk",
"18842":"ocaml",
"18841":"mozilla"
}

file = open("tags.csv")
tags = {}
for line in file:
  line.replace('"', '')
  cols = line.split(',')
  tag = cols[0]
  postId = cols[2]
  if not (postId in tags):
    tags[postId] = {}
  tags[postId][tag] = True


#file = open("posts.csv")
import codecs
file = codecs.open('posts.csv','rU',encoding='utf-8')

lIdx = 0
posts = []
for line in file:
  cIdx = 0
  columns = []
  while True:
    if line == "":
      break
    try:
      line = line
    except Exception as inst:
      print line
      print line[404]
      print "ex:", inst
      import sys
      sys.exit(0)
    line = re.sub("^\s*\"", "", line)

    escape = False
    column = ""
    charCount = 0
    for char in line:
      if escape:
        charCount += 1
        if char == 'n':
          column += "\n"
        elif char == 'r':
          column += "\r"
        elif char == '"':
          column += '"'
        else:
          column += "\\" + char
        escape = False
        continue

      if char == '"':
        break
      elif char == '\\':
        escape = True
      else:
        column += char
      charCount += 1
    
    line = line[charCount:]
    line = re.sub("^\",?[\r|\n]?", "", line)

    columns.append( column )
    cIdx += 1

  posts.append( columns )
  lIdx += 1

for col in posts:
  postId = col[0]
  catId = col[3]
  date = col[4]
  url = col[11]
  title = col[13]
  postContent = col[17]

  date = '-'.join(url.split('/')[:3])
  
  if col[21] != "1":
    print "--- IGNORED"
    print "    -- status: ", col[21]
    print "    -- title: ",title
    continue

  def replace (mo):
    path = mo.group(1) + mo.group(2)
    print "path=", path
    path = path.replace("./", "", 1)
    relpath = "public\\" + path.replace('/', os.sep)
    if os.path.exists(relpath + ".png"):
      return '"' + path + ".png"
    elif os.path.exists(relpath + ".jpg"):
      return '"' + path + ".jpg"
    else:
      raise Exception("Unable to found image %s", path)

  postContent = re.sub(r"\"([^\"\.]+)\.([\w_\.-]+)_.\.(png|jpg|jpeg)", replace, postContent)

  categories = []
  if not (postId in tags):
    tags[postId] = {}
  if catId and catId in categoriesMap:
    categorie = categoriesMap[catId]
    tags[postId][categorie] = True
  for tag in tags[postId]:
    categories.append(tag)
  
  processedTitle = title.replace('"', '\\"').replace('<', '&lt;')
  content = [
    "---",
    "layout: post",
    "title: \"" + processedTitle + "\"",
    "date: " + date,
    "comments: true",
    "categories: [" + ", ".join(categories) + "]",
    "---",
  ]
  content.append(postContent)
  #if "Jetpack runner" in title:
  #  print postContent

  filename = url.replace("/", "-") + ".markdown"
  import urllib
  filename = urllib.quote(filename, safe='~()*!.\'')
  print ""
  print filename
  url = urllib.quote(url, safe='~()*!.\'/')
  rurl = "http://blog.techno-barje.fr/post/"+url
  lurl = "http://localhost:4000/post/"+url+"/"
  print rurl
  print lurl
  print checkURL(lurl)
  print ""

  fileContent = "\n".join(content)
  #fileContent = fileContent.decode('iso-8859-1')#encode('utf8', 'ignore')#'xmlcharrefreplace')

  open(os.path.join("source","_posts",filename),
  'w').write(fileContent.encode('ascii', 'xmlcharrefreplace'))

  import time
  #time.sleep(0.5)

  
