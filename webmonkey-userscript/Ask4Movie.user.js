// ==UserScript==
// @name         Ask4Movie
// @description  Redirect top window to URL of embedded video iframe.
// @version      1.0.1
// @match        *://ask4movie.io/*
// @match        *://*.ask4movie.io/*
// @icon         https://ask4movie.io/wp-content/uploads/2018/04/cropped-A4M-Icon-32x32.png
// @run-at       document-end
// @grant        unsafeWindow
// @homepage     https://github.com/warren-bank/crx-Ask4Movie/tree/webmonkey-userscript/es5
// @supportURL   https://github.com/warren-bank/crx-Ask4Movie/issues
// @downloadURL  https://github.com/warren-bank/crx-Ask4Movie/raw/webmonkey-userscript/es5/webmonkey-userscript/Ask4Movie.user.js
// @updateURL    https://github.com/warren-bank/crx-Ask4Movie/raw/webmonkey-userscript/es5/webmonkey-userscript/Ask4Movie.user.js
// @namespace    warren-bank
// @author       Warren Bank
// @copyright    Warren Bank
// ==/UserScript==

// ----------------------------------------------------------------------------- URL redirect

var redirect_to_url = function(url) {
  if (!url) return

  if (typeof GM_loadUrl === 'function') {
    if (typeof GM_resolveUrl === 'function')
      url = GM_resolveUrl(url, unsafeWindow.location.href) || url

    GM_loadUrl(url, 'Referer', unsafeWindow.location.href)
  }
  else {
    try {
      unsafeWindow.top.location = url
    }
    catch(e) {
      unsafeWindow.window.location = url
    }
  }
}

// ----------------------------------------------------------------------------- inspect DOM

var get_iframe_url = function() {
  return process_encoded_scripts()
}

var process_encoded_scripts = function() {
  var iframe_url = null
  var prefix, scripts, base64, text

  prefix  = 'data:text/javascript;base64,'
  scripts = unsafeWindow.document.querySelectorAll('script[src^="' + prefix + '"]')

  if (scripts && scripts.length) {
    for (var i=0; i < scripts.length; i++) {
      try {
        base64     = scripts[i].getAttribute('src').slice(prefix.length)
        text       = atob(base64)
        iframe_url = process_decoded_scripts(text)
      }
      catch(e) {}

      if (iframe_url) break
    }
  }

  return iframe_url
}

var process_decoded_scripts = function(text) {
  var iframe_url = null
  var regex, matches, base64, html

  regex = {
    base64: /['"]([a-zA-Z0-9\+\/]+=*)['"]/g,
    iframe: /^.*<iframe [^>]*src=['"]([^'"]+)['"] [^>]*allowfullscreen.*$/
  }

  while (matches = regex.base64.exec(text)) {
    try {
      base64  = matches[1]
      html    = atob(base64)
      matches = regex.iframe.exec(html)

      if (matches)
        iframe_url = matches[1]
    }
    catch(e) {}

    if (iframe_url) break
  }

  return iframe_url
}

// ----------------------------------------------------------------------------- bootstrap

var init = function() {
  var iframe_url = get_iframe_url()

  if (iframe_url)
    redirect_to_url(iframe_url)
}

unsafeWindow.addEventListener('DOMContentLoaded', init)
unsafeWindow.addEventListener('load',             init)
init()

// -----------------------------------------------------------------------------
