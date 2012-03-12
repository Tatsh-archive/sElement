/**
 * Test browser data. This is generally not recommended for everything, and is
 *   intended to be a last resort when the version of the browser to target is
 *   known and the environment is controlled (such as when the user has
 *   absolutely no way to change the user agent).
 * @constructor
 */
var sBrowser = function () {};
/**
 * If the browser is IE.
 * @type (boolean|null)
 * @private
 */
sBrowser.isIEStatic = null;
/**
 * Browser conditional comment queries mapped to boolean values.
 * @type Object
 * @private
 */
sBrowser.isIEVersionStatics = {};
/**
 * Test if the browser is Internet Explorer using conditional comments.
 * @returns {boolean} <em>true</em> if the browser is Internet Explorer,
 *   <em>false</em> false otherwise.
 */
sBrowser.isIE = function () {
  if (sBrowser.isIEStatic === null) {
    var div = document.createElement('div');
    div.style.display = 'none';
    div.innerHTML = "<!--[if IE]><div id='ie-find'></div><[endif]-->";
    document.body.appendChild(div);

    if (document.getElementById('ie-find')) {
      sBrowser.isIEStatic = true;
    }
    else {
      sBrowser.isIEStatic = false;
    }

    document.body.removeChild(div);
  }

  return sBrowser.isIEStatic;
};
/**
 * Test if the browser matches an Internet Explorer conditional comment string.
 *   This is the part after the if keyword. Example: <code>lt IE 9</code>.
 * @param {string} version Version or query string.
 * @returns {boolean} If the browser matches.
 */
sBrowser.isIEVersion = function (version) {
  if (sBrowser.isIEVersionStatics[version] === undefined) {
    var div = document.createElement('div');
    div.style.display = 'none';
    div.innerHTML = "<!--[if IE " + version + "]><div id='ie-find'></div><[endif]-->";
    document.body.appendChild(div);

    if (document.getElementById('ie-find')) {
      sBrowser.isIEVersionStatics[version] = true;
    }
    else {
      sBrowser.isIEVersionStatics[version] = false;
    }

    document.body.removeChild(div);
  }

  return sBrowser.isIEVersionStatics[version];
};
