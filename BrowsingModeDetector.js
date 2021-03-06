/**
 * BrowsingModeDetector
 *
 * @returns {BrowsingModeDetector}
 * @constructor
 * @author Maykonn Welington Candido <maykonn@outlook.com>
 */
window.BrowsingModeDetector = function () {
  var _instance = this;
  var _ignoringBots = true;
  var _browsingInIncognitoMode;
  var _callbackForNormalMode;
  var _callbackForIncognitoOrPrivateMode;
  var _callbackDefault; // if given, will be executed even _callbackForNormalMode and _callbackForIncognitoOrPrivateMode are given

  this.BROWSING_NORMAL_MODE = 'NORMAL_MODE';
  this.BROWSING_INCOGNITO_PRIVATE_MODE = 'INCOGNITO_PRIVATE_MODE';

  /**
   * @returns {BrowsingModeDetector}
   */
  this.ignoringBots = function () {
    _ignoringBots = true;
    return this;
  };

  /**
   * @returns {BrowsingModeDetector}
   */
  this.notIgnoringBots = function () {
    _ignoringBots = false;
    return this;
  };

  this.getBrowsingMode = function () {
    return (_browsingInIncognitoMode ? this.BROWSING_INCOGNITO_PRIVATE_MODE : this.BROWSING_NORMAL_MODE);
  };

  this.setBrowsingInIncognitoMode = function () {
    _browsingInIncognitoMode = true;
  };

  this.setBrowsingInNormalMode = function () {
    _browsingInIncognitoMode = false;
  };

  /**
   * @param callback optional
   */
  this.isBotBrowsing = function (callback) {
    var userAgentToTest = window.navigator.userAgent;
    var isBot = /googlebot|Googlebot-Mobile|Googlebot-Image|Google favicon|Mediapartners-Google|bingbot|slurp|java|wget|curl|Commons-HttpClient|Python-urllib|libwww|httpunit|nutch|phpcrawl|msnbot|jyxobot|FAST-WebCrawler|FAST Enterprise Crawler|biglotron|teoma|convera|seekbot|gigablast|exabot|ngbot|ia_archiver|GingerCrawler|webmon |httrack|webcrawler|grub.org|UsineNouvelleCrawler|antibot|netresearchserver|speedy|fluffy|bibnum.bnf|findlink|msrbot|panscient|yacybot|AISearchBot|IOI|ips-agent|tagoobot|MJ12bot|dotbot|woriobot|yanga|buzzbot|mlbot|yandexbot|purebot|Linguee Bot|Voyager|CyberPatrol|voilabot|baiduspider|citeseerxbot|spbot|twengabot|postrank|turnitinbot|scribdbot|page2rss|sitebot|linkdex|Adidxbot|blekkobot|ezooms|dotbot|Mail.RU_Bot|discobot|heritrix|findthatfile|europarchive.org|NerdByNature.Bot|sistrix crawler|ahrefsbot|Aboundex|domaincrawler|wbsearchbot|summify|ccbot|edisterbot|seznambot|ec2linkfinder|gslfbot|aihitbot|intelium_bot|facebookexternalhit|yeti|RetrevoPageAnalyzer|lb-spider|sogou|lssbot|careerbot|wotbox|wocbot|ichiro|DuckDuckBot|lssrocketcrawler|drupact|webcompanycrawler|acoonbot|openindexspider|gnam gnam spider|web-archive-net.com.bot|backlinkcrawler|coccoc|integromedb|content crawler spider|toplistbot|seokicks-robot|it2media-domain-crawler|ip-web-crawler.com|siteexplorer.info|elisabot|proximic|changedetection|blexbot|arabot|WeSEE:Search|niki-bot|CrystalSemanticsBot|rogerbot|360Spider|psbot|InterfaxScanBot|Lipperhey SEO Service|CC Metadata Scaper|g00g1e.net|GrapeshotCrawler|urlappendbot|brainobot|fr-crawler|binlar|SimpleCrawler|Livelapbot|Twitterbot|cXensebot|smtbot|bnf.fr_bot|A6-Indexer|ADmantX|Facebot|Twitterbot|OrangeBot|memorybot|AdvBot|MegaIndex|SemanticScholarBot|ltx71|nerdybot|xovibot|BUbiNG|Qwantify|archive.org_bot|Applebot|TweetmemeBot|crawler4j|findxbot|SemrushBot|yoozBot|lipperhey|y!j-asr|Domain Re-Animator Bot|AddThis/i.test(userAgentToTest);
    return (typeof callback === 'undefined' ? isBot : callback(isBot));
  };

  /**
   * @param callback
   * @returns {BrowsingModeDetector}
   */
  this.setCallbackForNormalMode = function (callback) {
    _callbackForNormalMode = callback;
    return this;
  };

  /**
   * @param callback
   * @returns {BrowsingModeDetector}
   */
  this.setCallbackForIncognitoOrPrivateMode = function (callback) {
    _callbackForIncognitoOrPrivateMode = callback;
    return this;
  };

  /**
   * @param defaultCallback optional
   */
  this.do = function (defaultCallback) {
    _validateUserCallback(defaultCallback);

    if (_ignoringBots && this.isBotBrowsing()) {
      _browsingInIncognitoMode = false;
      _executeUserCallback();
      return;
    }

    (new BrowserFactory())
      .browser(this)
      .detectBrowsingMode(_executeUserCallback);
  };

  var _validateUserCallback = function (defaultCallback) {
    _callbackDefault = defaultCallback;

    if (
      typeof _callbackDefault !== 'function' &&
      (typeof _callbackForNormalMode !== 'function' || typeof _callbackForIncognitoOrPrivateMode !== 'function')
    ) {
      throw 'Default callback or specific callbacks are required';
    }
  };

  var _executeUserCallback = function () {
    if (_browsingInIncognitoMode && typeof _callbackForIncognitoOrPrivateMode === 'function') {
      _callbackForIncognitoOrPrivateMode(_instance);
    } else if (!_browsingInIncognitoMode && typeof _callbackForNormalMode === 'function') {
      _callbackForNormalMode(_instance);
    }

    if (typeof _callbackDefault !== 'undefined') {
      _callbackDefault(_browsingInIncognitoMode, _instance);
    }
  };

  return this;
};


/**
 * @returns {BrowserFactory}
 * @constructor
 */
var BrowserFactory = function () {
  var _browser;

  this.browser = function (BrowsingModeDetector) {
    if (typeof _browser === 'object') {
      return _browser;
    }

    return _browser = _resolve(BrowsingModeDetector);
  };

  /**
   * @param {BrowsingModeDetector} BrowsingModeDetector
   * @returns {*}
   * @private
   */
  var _resolve = function (BrowsingModeDetector) {
    if (/constructor/i.test(window.HTMLElement) || navigator.vendor && navigator.vendor.indexOf('Apple') > -1) {
      return new SafariBrowser(BrowsingModeDetector);
    } else if ('MozAppearance' in document.documentElement.style) {
      return new MozillaBrowser(BrowsingModeDetector);
    } else if (window.webkitRequestFileSystem) {
      return new WebkitBrowser(BrowsingModeDetector);
    } else if (window.PointerEvent || window.MSPointerEvent) {
      return new IE10EdgeBrowser(BrowsingModeDetector);
    } else {
      return new OtherBrowser(BrowsingModeDetector);
    }
  };

  return this;
};


/**
 * @param {BrowsingModeDetector} BrowsingModeDetector
 * @returns {WebkitBrowser}
 * @constructor
 */
var WebkitBrowser = function (BrowsingModeDetector) {
  var self = this;
  this.STORAGE_QUOTA_LIMIT = 120000000; // There’s a hard limit of 120MB while this is not the case for non-incognito window
  this.TEMP_STORAGE_QUOTA_LIMIT = 110000000; // There’s a hard limit of 110MB while this is not the case for non-incognito window
  this.BrowsingModeDetector = BrowsingModeDetector;

  this.detectBrowsingMode = function (_executeUserCallback) {
    var callbackWhenWebkitTemporaryStorageQuotaNotLimited = function () {
      self.BrowsingModeDetector.setBrowsingInNormalMode();
      _executeUserCallback();
      return;
    };

    var callbackWhenWebkitTemporaryStorageQuotaLimited = function () {
      self.BrowsingModeDetector.setBrowsingInIncognitoMode();
      _executeUserCallback();
      return;
    };

    var checkWebkitTemporaryStorageQuota = function () {
      if (typeof navigator.webkitTemporaryStorage != 'undefined' && 
      typeof navigator.webkitTemporaryStorage.queryUsageAndQuota != 'undefined') {
        navigator.webkitTemporaryStorage.queryUsageAndQuota(function(usedBytes, grantedBytes) {
          if (grantedBytes < self.TEMP_STORAGE_QUOTA_LIMIT){
            callbackWhenWebkitTemporaryStorageQuotaLimited();
          } else {
            callbackWhenWebkitTemporaryStorageQuotaNotLimited();
          }
        }, function(e) {
          callbackWhenWebkitTemporaryStorageQuotaNotLimited();
        });
      } else {
        callbackWhenWebkitTemporaryStorageQuotaNotLimited();
      }
    };

    var callbackWhenWebkitStorageQuotaNotLimited = function () {
      checkWebkitTemporaryStorageQuota();
      return;
    };

    var callbackWhenWebkitStorageQuotaLimited = function () {
      self.BrowsingModeDetector.setBrowsingInIncognitoMode();
      _executeUserCallback();
      return;
    };

    var checkStorageQuota = function () {
      if (typeof navigator.storage != 'undefined' && 
      typeof navigator.storage.estimate != 'undefined') {
        navigator.storage.estimate().then(function(estimate) {
          if (estimate.quota < self.STORAGE_QUOTA_LIMIT){
            callbackWhenWebkitStorageQuotaLimited();
          } else {
            callbackWhenWebkitStorageQuotaNotLimited();
          } 
        });
      } else {
        callbackWhenWebkitStorageQuotaNotLimited();
      }
    };

    // The window.webkitRequestFileSystem() is not accessible on Chrome 78
    checkStorageQuota();
  };

  return this;
};

/**
 * @param {BrowsingModeDetector} BrowsingModeDetector
 * @returns {MozillaBrowser}
 * @constructor
 */
var MozillaBrowser = function (BrowsingModeDetector) {
  this.BrowsingModeDetector = BrowsingModeDetector;

  this.detectBrowsingMode = function (_executeUserCallback) {
    var self = this;

    var callbackWhenIndexedDBSuccess = function () {
      self.BrowsingModeDetector.setBrowsingInNormalMode();
      _executeUserCallback();
      return;
    };

    var callbackWhenIndexedDBError = function () {
      self.BrowsingModeDetector.setBrowsingInIncognitoMode();
      _executeUserCallback();
      return;
    };

    window.tempIndexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    if (window.tempIndexedDB) {
      var req = window.tempIndexedDB.open('test');
      req.onerror = function(event) {
        callbackWhenIndexedDBError();
      };
      req.onsuccess = function(event) {
        callbackWhenIndexedDBSuccess();
      };
    };
  };

  return this;
};

/**
 * @param {BrowsingModeDetector} BrowsingModeDetector
 * @returns {SafariBrowser}
 * @constructor
 */
var SafariBrowser = function (BrowsingModeDetector) {
  this.BrowsingModeDetector = BrowsingModeDetector;

  this.detectBrowsingMode = function (_executeUserCallback) {
    // From https://github.com/jLynx/PrivateWindowCheck
    if (window.safariIncognito) {
      this.BrowsingModeDetector.setBrowsingInIncognitoMode();
      _executeUserCallback();
      return;
    }
    // iOS 11
    // From gist discussion: https://gist.github.com/cou929/7973956#gistcomment-2272103 and
    // https://github.com/jLynx/PrivateWindowCheck
    try {
      window.openDatabase(null, null, null, null);
      window.localStorage.setItem("test", 1);
    } catch (e) {
      this.BrowsingModeDetector.setBrowsingInIncognitoMode();
      _executeUserCallback();
      return;
    }

    // Older Safari
    try {
      if (!localStorage.length) {
        localStorage.i = 1;
        localStorage.removeItem('i');
      }
      this.BrowsingModeDetector.setBrowsingInNormalMode();
    } catch (e) {
      // From: https://gist.github.com/jherax/a81c8c132d09cc354a0e2cb911841ff1
      // Safari only enables cookie in private mode
      // if cookie is disabled then all client side storage is disabled
      // if all client side storage is disabled, then there is no point
      // in using private mode
      if (navigator.cookieEnabled) {
        this.BrowsingModeDetector.setBrowsingInIncognitoMode();
      } else {
        this.BrowsingModeDetector.setBrowsingInNormalMode();
      }
    }

    _executeUserCallback();
    return;
  };

  return this;
};

/**
 * @param {BrowsingModeDetector} BrowsingModeDetector
 * @returns {IE10EdgeBrowser}
 * @constructor
 */
var IE10EdgeBrowser = function (BrowsingModeDetector) {
  this.BrowsingModeDetector = BrowsingModeDetector;

  this.detectBrowsingMode = function (_executeUserCallback) {
    if (window.indexedDB) {
      this.BrowsingModeDetector.setBrowsingInNormalMode();
    } else {
      this.BrowsingModeDetector.setBrowsingInIncognitoMode();
    }
    _executeUserCallback();
  };

  return this;
};

/**
 * @param {BrowsingModeDetector} BrowsingModeDetector
 * @returns {OtherBrowser}
 * @constructor
 */
var OtherBrowser = function (BrowsingModeDetector) {
  this.BrowsingModeDetector = BrowsingModeDetector;

  this.detectBrowsingMode = function (_executeUserCallback) {
    this.BrowsingModeDetector.setBrowsingInNormalMode();
    _executeUserCallback();
  };

  return this;
};
