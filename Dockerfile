FROM ubuntu:16.04

RUN apt-get update -y && apt-get -y install \
  sudo \
  gcc make \
  git \
  vim less \
  curl \
  ruby ruby-dev \
  python2.7 python-pip python-dev

# Add blogger user
RUN adduser --disabled-password --gecos "" blogger && \
echo "blogger ALL=(root) NOPASSWD:ALL" > /etc/sudoers

USER blogger

# Directory for the blog files
RUN sudo mkdir /octopress
WORKDIR /octopress

# Set permissions so blogger can install gems
RUN sudo chown -Rv blogger:blogger /octopress
RUN sudo chown -Rv blogger:blogger /var/lib/gems
RUN sudo chown -Rv blogger:blogger /usr/local/bin

# Expose port 4000 so we can preview the blog
EXPOSE 4000

# Add the Gemfile and install the gems
ADD Gemfile /octopress/Gemfile
RUN gem install bundler
RUN bundle install
