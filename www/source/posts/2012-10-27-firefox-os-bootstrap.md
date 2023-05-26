---
layout: post
title: "Firefox OS Bootstrap: How to Build It on a VM"
date: 2012-10-27
categories: [mozilla, firefox-os, b2g, pm]
mastodon-comments: https://piaille.fr/@technobarje/110443213893664252
---

During my on-boarding on Firefox OS team I kept a draft of all necessary stuff that need to be done in order to build the project and flash it to the phone.
I'm pretty sure it can help people on-boarding the project by having a single page that would allow anyone to start working on Firefox OS. I highly suggest you to take a look at [MDN Firefox OS documentation](https://developer.mozilla.org/en-US/docs/Mozilla/Firefox_OS) if you visit this page later on, as this blogpost will most likely be outdated in some weeks.

# Environnement

## Use a Virtual Machine

I'm suggesting everyone to use a VM. It allows you to use exactly same environment, in order to maximize your chances to succeed building Firefox OS!
Using another OS, another linux distro or even another Ubuntu version will introduce differences in dependencies versions and can easily give you errors no one but you are facing :(

You can use VMware Player which is free and available [here](https://my.vmware.com/web/vmware/free#desktop_end_user_computing/vmware_player/4_0), or any other VM software you are confortable with that has decent USB support (required to flash the phone).

## Use Ubuntu 11.10

For the same reason than the VM, I suggest you to use the [recommended linux distro and version](https://developer.mozilla.org/en-US/docs/Mozilla/Boot_to_Gecko/B2G_build_prerequisites#Requirements_for_Linux) 
You can download this [Ubuntu 11.10 x64 ISO image](http://releases.ubuntu.com/oneiric/ubuntu-11.10-desktop-amd64.iso) and create a VM out of it (It is super easy with VMware, it almost does everything for you). The only important things are to set a large enough virtual drive, 30GB is a safe minimum, and enough memory, 4GB is a safe minimum.


Now open a terminal and launch all following commands in order to install all necessary dependencies.

# Install dependencies

## Install build dependencies:

```
sudo apt-get install build-essential bison flex lib32ncurses5-dev lib32z1-dev lib32z1-dev ia32-libs libx11-dev libgl1-mesa-dev gawk make curl bzip2  g++-multilib libc6-dev-i386 autoconf2.13 ccache git
sudo apt-get build-dep firefox
```

## Java JDK 6 needed for adb

```
# The following PPA allows you to easily install the JDK through apt-get
sudo add-apt-repository ppa:ferramroberto/java
sudo apt-get update
sudo apt-get install sun-java6-jdk
```

## Android SDK in order install adb

```
# Your first need to install 32 bit libs as we are using 64bit OS
# otherwise, you will have following error while running adb:
# $ adb: No such file or directory
sudo apt-get install ia32-libs

# There is no particular reason to use this SDK version
# It was the current version when I've installed it
wget http://dl.google.com/android/android-sdk_r20.0.3-linux.tgz
tar zxvf android-sdk_r20.0.3-linux.tgz
cd android-sdk-linux/
# The following command installs only "platform-tools" package which
# contains adb and fastboot
./tools/android update sdk --no-ui --filter 1,platform-tool

# Register adb in your PATH
echo "PATH=`pwd`/platform-tools:\$PATH" >> ~/.bashrc

# Execute in a new bash instance in order to gain from this new PATH
bash
```

## Tweak udev in order to recognize your phone

If you do not do that at all, or not properly, `$ adb devices` will print this:
```
???????????? no permissions
```
You need to put the following content into `/etc/udev/rules.d/51-android.rules`

```
cat <<EOF | sudo tee -a /etc/udev/rules.d/51-android.rules
SUBSYSTEM=="usb", ATTRS{idVendor}=="19d2", MODE="0666"
SUBSYSTEM=="usb", ATTRS{idVendor}=="18d1", MODE="0666"
EOF
sudo restart udev
```
Here I register only internal Mozilla phones otoro and unagi IDs.
You may want to add lines for other phones. See [this webpage](http://developer.android.com/tools/device.html#VendorIds) for other vendor IDs.

# Checkout all necessary projects

## Checkout B2G repository

```
git clone https://github.com/mozilla-b2g/B2G.git
```
Take a minute to configure git, otherwise next steps will keep bugging you asking for your name and email.
```
cat > ~/.gitconfig <<EOF
[user]
  name = My name
  email = me@mail.com
[color]
  ui = auto
EOF
```

## Connect your phone and ensure it is visible from your VM.

In order to do so run `adb devices`, you should see non-empty list of devices.
```
$ adb devices
List of devices attached
full_unagi       device
```
If you see `no permissions` message, checkout udev step.<br />
Note that you have to setup your Virtual machine software to connect the USB port to the VM. In VMware player, click on: `Player menu > Removable devices > "...something..." Android > Connect (Disconnnect from host)`.<br />


## Checkout all dependencies necessary for your particular phone

Before running the following command, ensure that your phone is connected.
Note that you have to run this command with **your phone still being on Android OS and ICS version**. If your phone is already on B2G, you will have to retrieve the backup-otoro or backup-unagi folder automatically created when running the following command.<br/>
If your device is on an Android version older than ICS, you will have to flash it first to ICS. For both of these issues, ask in #b2g for help.
This step will take a while, as it will download tons of big projects: android, gong, kernel, mozilla-central, gaia,... More than 4GB of git repositories, so be patient.
```
cd B2G/
# Run ./config --help for the list of supported phones.
./config.sh unagi
```

## Install Qualcomm Areno graphic driver

Only if you are aiming to build Firefox OS for otoro or unagi phones,
you will have to manually download Qualcomm areno armv7 graphic driver, available [here](https://developer.qualcomm.com/file/10127). <br/>
Unfortunately, you will have to register to this website in order to be able to download this file. Once downloaded, put this `Adreno200-AU_LINUX_ANDROID_ICS_CHOCO_CS.04.00.03.06.001.zip` into your `B2G` directory.


# Build Firefox OS

If ./config.sh went fine, you can now build Firefox OS!
```
./build.sh
```
Here is the possible error you might see:

* `arm-linux-androideabi-g++: Internal error: Killed (program cc1plus)`

  You are most likely lacking of memory. 4GB is a safe minimum.

* `KeyedVector.h:193:31: error: indexOfKey was not declared in this scope, and no declarations were found by argument-dependent lookup at the point of instantiation [-fpermissive]`

  Your gcc version is too recent. Try using gcc 4.6.x version.


# Flash the phone

If ./build.sh went fine, you can now flash your phone:
```
  ./flash.sh
```
Note that I have to unplug replug the device in order to make it work in the VM.
When running ./flash.sh, the unagi phone switch to a blue screen, then ./flash.sh script is stuck on `< waiting device >` message. If I unplug and plug in back, it immediately starts flashing. Be carefull if you have to do the same, ensure that ./flash.sh doesn't start flashing when you unplug it! <br/><br/>
If ./flash.sh failed by saying that the image is too large, It might mean that you have to root your phone first. Again, ask in #b2g for help.
