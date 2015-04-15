[![Build Status](https://travis-ci.org/dz0ny/LiveReload-sublimetext2.png?branch=devel)](https://travis-ci.org/dz0ny/LiveReload-sublimetext2)
[![Fattrme](http://api.flattr.com/button/flattr-badge-large.png)](http://flattr.com/thing/1492893/dz0nyLiveReload-sublimetext2-on-GitHub)
[![Gittip](http://badgr.co/gittip/dz0ny.png)](https://www.gittip.com/dz0ny/)



# LiveReload for Sublime Text 3

A web browser page reloading plugin for the [Sublime Text 3](http://sublimetext.com "Sublime Text 3") editor. 

## Installing

Open Terminal and

### Linux users

```
cd ~/.config/sublime-text-3/Packages
rm -rf LiveReload
git clone -b devel https://github.com/dz0ny/LiveReload-sublimetext2.git LiveReload
```

### OSX users

```
cd ~/Library/Application\ Support/Sublime\ Text\ 3/Packages/
rm -rf LiveReload
git clone -b devel https://github.com/dz0ny/LiveReload-sublimetext2.git LiveReload
```

# Using

Enable the desired plug-ins via Command Palette (Ctrl+Shift+P) and add livereload.js to your html document:

```
<script>document.write('<script src="http://' + (location.host || 'localhost')
.split(':')[0] + ':35729/livereload.js?snipver=1"></' + 'script>')</script>
```

Alternatively you can use one of the browser extensions listed here: http://go.livereload.com/extensions.

## Available plug-ins:

 - Compass Preprocessor, compiles .scss, .sass and refreshes page when file is compiled
 - Less Preprocessor, compiles .less and refreshes page when file is compiled
 - CoffeeScript Preprocessor, compiles .coffee and refreshes page when file is compiled
 - Simple Reload, refresh page when file is saved
 - Simple Reload with delay(400ms), wait 400ms then refresh page, when file is saved

## Examples

 - Simple Reload from http GET request, reloads page on visit to http://localhost:35729/callback/simplereloadplugincallback/on_post_compile
 - Send content on change, sends file content to browser console

# Plug-in api

https://livereload-for-sublime-text.readthedocs.org/en/latest/
