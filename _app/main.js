// Sticky TOC

var echo = require('./echo');
var UI = require('./UI');

(function() {
  function updateTocPosition() {
    var scrollPos = window.pageYOffset || document.documentElement.scrollTop;
    var windowWidth = window.innerWidth || document.body.clientWidth;
    var toc = document.getElementById('toc');
    if (scrollPos > 250) {
      if (windowWidth > 1104) {
        toc.style.position = 'fixed';
        toc.style.left = document.getElementById('getting-started').getBoundingClientRect().left - 230 + 'px';
      } else if (windowWidth > 760) {
        toc.style.position = 'fixed';
        toc.style.left = document.getElementById('getting-started').getBoundingClientRect().left - 210 + 'px';
      }
    } else {
      toc.style.position = 'absolute';
      toc.style.left = '0';
    }
  }

  window.onscroll = window.onresize = updateTocPosition;
  updateTocPosition();
})();

// application.js
// Setup empty objects for organizational purposes.
// These objects will be common to both the website and the mobile website.
var App = {};
App.Models = {};
App.Models.Docs = {};
App.Models.Apps = {};
App.Collections = {};
App.Views = {};

// live_toc.js
(function(UI, _) {
	if (!UI) {
		return;
	}

	var LiveTOC = UI.LiveTOC = function(options) {
		this.parent = options.parent;
		this.content = options.content;
		this.scrollContent = options.scrollContent || options.content;

		this.throttleInterval = options.throttleInterval || 300;
		this.alignment = options.alignment || 'center';
		this.onSelect = options.onSelect || null;

		this.currentItem = null;
		this._headerHeights = {};
		this._sortedHeights = [];

		this.render();
		if (options.parent) {
			this.attach(options.parent);
		}
		this.initializeEventHandlers();
	};

	LiveTOC.prototype = {
		initializeEventHandlers: function() {
			var throttled = _.throttle(this.handleScroll.bind(this), this.throttleInterval);

			if (this.scrollContent === document.getElementsByTagName('body')[0]) {
				document.addEventListener('scroll', throttled);
			} else {
				this.scrollContent.addEventListener('scroll', throttled);
			}
		},

		render: function() {
			// we really need this to calculate header heights
			this.scrollContent.style.position = "relative";

			// add toc data
			this.node = document.getElementsByClassName('ui_live_toc')[0];

			// calculate the cached heights of each header in the text
			$(document).ready(function(e) {
        this.updateHeights();
        if (window.location.hash) {
          this.hashChanged = true;
        }
        this.handleScroll();
      }.bind(this));
      $(window).on('hashchange', function() {
        this.hashChanged = true;
      }.bind(this));
		},

		// Update the internal tracking of header heights. Should be called when
		// the content changes in a way that will affect the height of headers
		updateHeights: function() {
			var headerHeights = {};
			var sortedHeights = [];
			var headers = this.content.querySelectorAll('h1, h2, h3');
			for (var i = 0; i < headers.length; i++) {
				// var anchor = headers[i].getElementsByTagName('a')[0];
				// var name = anchor.name;
        var name = headers[i].id;

				headerHeights[headers[i].offsetTop] = name;
				sortedHeights.push(headers[i].offsetTop);
			}
			this._headerHeights = headerHeights;
			this._sortedHeights = sortedHeights.sort(function(a,b) { return a - b; });
    },

    findBestLink: function() {
      var fromTop = this.scrollContent.scrollTop;
			// firefox doesn't like this so we fallback to window
			if (fromTop === 0) {
				fromTop = $(window).scrollTop();
      }
      var renderedHeight = this.scrollContent.offsetHeight;

			var cur;
			if (this.alignment === 'top') {
				cur = fromTop;
			} else if (this.alignment === 'bottom') {
				cur = renderedHeight + fromTop;
			} else { // fallback to center line
				cur = renderedHeight / 2 + fromTop;
			}

			// find closest header above the current location
			var bestHeight = this._sortedHeights[0];
			for (var i = 0; i < this._sortedHeights.length; i++) {
				if (this._sortedHeights[i] > cur) {
					break; // break once we've passed current
				}
				bestHeight = this._sortedHeights[i];
			}

      var best = this._headerHeights[bestHeight];
      return best;
    },

		// find out what item to highlight in the TOC and what section
		// to collapse/expand
		handleScroll: function() {
      var best;
      if (this.hashChanged) {
        this.hashChanged = false;
        best = window.location.hash.replace('#', '');
      } else {
        best = this.findBestLink();
      }

			// only render if nothing is selected or selection has changed
			if (this.currentItem === null || this.currentItem.getAttribute('data-name') !== best) {
				// if we have a new item selected, remove current selection
				var listItems = this.node.getElementsByTagName('li');
				for (var j = 0; j < listItems.length; j++) {
					UI.removeClass(listItems[j], 'selected');
				}

				// set newly selected item and add the class
        var foundLink = this.node.querySelector('[href="#' + best + '"]');
        if (!foundLink) {
          return;
        }
        this.currentItem = foundLink.parentElement;
				if (this.currentItem === null) {
					return;
        }
        // set back the attribute on the item for debouncing
        if (this.currentItem.dataset) {
          this.currentItem.dataset.name = best;
        }
				UI.addClass(this.currentItem, 'selected');

				// if the item was a minor header, also select parent (major header)
				if (UI.hasClass(this.currentItem, 'ui_live_toc_3')) {
					UI.addClass(this.currentMajorSection(), 'selected');
				}

				// if the item was a major header or minor header, also select parent (main header)
				if (UI.hasClass(this.currentItem, 'ui_live_toc_2') ||
					UI.hasClass(this.currentItem, 'ui_live_toc_3'))
				{
					UI.addClass(this.currentMainSection(), 'selected');
				}
			}
		},

		/* Utility functions about the state of the content & location */

		// find the current main section expanded (this is tied to H1s)
		currentMainSection: function() {
			var cur = this.currentItem;
			while (cur && !UI.hasClass(cur, 'ui_live_toc_1')) {
				cur = cur.parentElement;
			}
			return cur;
		},

		// find the current major section expanded (this is tied to H2s)
		currentMajorSection: function() {
			if (UI.hasClass(this.currentItem, 'ui_live_toc_1')) {
				return false;
			}

			var cur = this.currentItem;
			while (!UI.hasClass(cur, 'ui_live_toc_2')) {
				cur = cur.parentElement;
			}
			return cur;
		}
	};

	_.extend(LiveTOC.prototype, UI.ComponentProto);

})(UI, _);

// docs_toggle.js
(function(UI, _) {
	if (!UI) {
		return;
	}

	if (!App.Views.Docs) {
		App.Views.Docs = {};
	}

	var Toggle = App.Views.Docs.Toggle = function(options) {
		this.parent = options.parent;
		this.opt1 = options.opt1;
		this.opt2 = options.opt2;
		this.label1 = options.label1;
		this.label2 = options.label2;
		this.onChange = options.onChange;
		this.render();
	};

	Toggle.prototype = {
		render: function() {
      var opt1 = this.opt1;
      var self = this;
      $('.language-toggle').each(function(i, block) {
        $(block.children).each(function(i, node) {
          // manually rendered
          var isOpt1 = false;
          var isOpt2 = false;
          var toggleTarget;
          if (node.tagName === 'PRE') {
            isOpt1 = node.firstChild.className.indexOf(self.opt1) >= 0;
            isOpt2 = node.firstChild.className.indexOf(self.opt2) >= 0;
            if (isOpt1) {
              $(node).addClass(`language-${self.opt1}`);
            }
            if (isOpt2) {
              $(node).addClass(`language-${self.opt2}`);
            }
            toggleTarget = node;
          } else {
            // pre-rendered through markdown
            isOpt1 = node.className.indexOf(self.opt1) >= 0
            isOpt2 = node.className.indexOf(self.opt2) >= 0
            toggleTarget = $(node).find('pre.highlight').first();
          }

          if (isOpt1) {
            toggleTarget.append(self.renderToggle(true));
          } else if (isOpt2) {
            toggleTarget.append(self.renderToggle(false));
          }
          UI.addClass(node, 'has_toggles');
        });
      });
			$('.' + this.opt2 + '-toggle').on('click', this.showOpt2.bind(this));
			$('.' + this.opt1 + '-toggle').on('click', this.showOpt1.bind(this));
			this.toggleOpt(true);
		},

		renderToggle: function(selectOpt1) {
			var toggle = UI.tag('div', { className: 'toggles' }, [
				UI.tag('div', { className: 'toggle-item' }, [
					UI.tag('a', { className: this.opt1 + '-toggle', href: '#' }, this.label1)
				]),
				UI.tag('div', { className: 'toggle-item' }, [
					UI.tag('a', { className: this.opt2 + '-toggle', href: '#' }, this.label2)
				]),
			]);

			if (selectOpt1 === true) {
				UI.addClass(toggle.childNodes[0], 'selected');
			} else {
				UI.addClass(toggle.childNodes[1], 'selected');
			}

			return toggle;
		},

		showOpt1: function(e) {
			e && e.preventDefault();

      $(`.language-toggle .language-${this.opt2}`).hide();
      $(`.language-toggle .language-${this.opt1}`).show();
		},

		showOpt2: function(e) {
			e && e.preventDefault();

      $(`.language-toggle .language-${this.opt2}`).show();
      $(`.language-toggle .language-${this.opt1}`).hide();
		},

		toggleOpt: function(showOpt1) {
			if (showOpt1 === true) {
        $(`.language-toggle .language-${this.opt2}`).hide();
        $(`.language-toggle .language-${this.opt1}`).show();
			} else {
        $(`.language-toggle .language-${this.opt2}`).show();
        $(`.language-toggle .language-${this.opt1}`).hide();
			}
			this.onChange();
		}
	};

	_.extend(Toggle.prototype, UI.ComponentProto);

})(UI, _);

// docs.js
(function(UI, _) {
	if (!UI) {
		return;
	}

	if (!App.Views.Docs) {
		App.Views.Docs = {};
	}

	var Docs = App.Views.Docs.Main = function(options) {
		this.platform = options.platform;
		this.language = options.language;
		this.render();
	};

	Docs.prototype = {
		render: function() {
			// create the TOC
			this.scrollContent = document.getElementsByTagName('body')[0];


      // add toggles to code blocks if necessary
      if (this.platform === "ios" || this.platform === "osx" || this.platform === "macos") {
        new App.Views.Docs.Toggle({
          parent: this.scrollContent,
          opt1: 'objective_c',
          opt2: 'swift',
          label1: 'Objective-C',
          label2: 'Swift',
          onChange: this.handleToggleChange.bind(this)
        });
      } else if (this.platform === "rest") {
        new App.Views.Docs.Toggle({
          parent: this.scrollContent,
          opt1: 'bash',
          opt2: 'python',
          label1: 'cURL',
          label2: 'Python',
          onChange: this.handleToggleChange.bind(this)
        });
      }

			// move the TOC with the content. Since it's fixed, we can't just do it in css :(
      $(window).on('resize', _.throttle(this.handleWindowResize.bind(this), 300));
      // calculate final position of headers for the TOC once
      // the DOM is loaded (including images)
      $(window).on('load', function() {
        this.toc && this.toc.updateHeights();
      }.bind(this));

      $(function() {
        this.toc = new UI.LiveTOC({
          parent: document.getElementById('toc'),
          scrollContent: this.scrollContent,
          content: document.getElementsByClassName('guide_content')[0]
        });
        // setup the server/mount path editor
        this.setupServerFieldCustomization();
        this.mobileToc = document.getElementById('mobile_toc').getElementsByTagName('select')[0];
        this.renderMobileTOC();
        this.handleWindowResize();
      }.bind(this));
		},

		renderMobileTOC: function() {
      var h1s = this.scrollContent.getElementsByTagName('h1');
      var fragment = document.createDocumentFragment();
			for (var i = 0; i < h1s.length; i++) {
        // var anchor = h1s[i].getElementsByTagName('a')[0];
        var optionElement = UI.tag('option', { 'data-anchor': "#"+h1s[i].id }, [ h1s[i].textContent ]);
        fragment.appendChild(optionElement);
      }
      this.mobileToc.appendChild(fragment);
			this.mobileToc.addEventListener('change', this.handleSelectChange.bind(this));
			this.mobileToc.getElementsByTagName('option')[0].setAttribute('selected', true);
		},

    setupServerFieldCustomization: function setupServerFieldCustomization() {

		  if(!document.getElementById('parse-server-custom-url')) {
		    // no customization available on this page
		    return;
      }

      if (typeof(Storage) !== "undefined") {
        // apply previous values from local storage
        const _url        = localStorage.getItem('parse-server-custom-url');
        const _mount      = localStorage.getItem('parse-server-custom-mount');
        const _protocol   = localStorage.getItem('parse-server-custom-protocol');
        const _appId      = localStorage.getItem('parse-server-custom-appid');
        const _masterKey  = localStorage.getItem('parse-server-custom-masterkey');
        const _clientKey  = localStorage.getItem('parse-server-custom-clientkey');
        const _restApiKey  = localStorage.getItem('parse-server-custom-restapikey');

        // set existing entries
        if (_url) {
          $(".custom-parse-server-url").html(_url);
          $("#parse-server-custom-url").val(_url);
        }
        if (_mount) {
          $(".custom-parse-server-mount").html(_mount);
          $("#parse-server-custom-mount").val(_mount);
        }
        if (_protocol) {
          $(".custom-parse-server-protocol").html(_protocol);
          $("#parse-server-custom-protocol").val(_protocol);
        }
        if (_appId) {
          $(".custom-parse-server-appid").html(_appId);
          $("#parse-server-custom-appid").val(_appId);
        }
        if (_masterKey) {
          $(".custom-parse-server-masterkey").html(_masterKey);
          $("#parse-server-custom-masterkey").val(_masterKey);
        }
        if (_clientKey) {
          $(".custom-parse-server-clientkey").html(_clientKey);
          $("#parse-server-custom-clientkey").val(_clientKey);
        }
        if (_restApiKey) {
          $(".custom-parse-server-restapikey").html(_restApiKey);
          $("#parse-server-custom-restapikey").val(_restApiKey);
        }
      }

      // set url listener
      $('#parse-server-custom-url').keyup(function() {
        const url = $('#parse-server-custom-url').val();
        if(!url.match(/^[-_a-z0-9\.]+(?::[0-9]+)?$/i)) {
          // not a valid url
          return;
        }
        $(".custom-parse-server-url").html(url);
        if (typeof(Storage) !== "undefined") {
          localStorage.setItem('parse-server-custom-url', url);
        }
      });

      // set mount listener
      $('#parse-server-custom-mount').keyup(function() {
        var mount = $('#parse-server-custom-mount').val();
        if(!mount.match(/^[-_a-z0-9\/]+$/i) && mount !== '') {
          // not a valid mount path, and not empty
          return;
        }
        if(!mount.match(/^\//)) {
          // add leading slash
          mount = '/'+mount;
        }
        if(!mount.match(/\/$/)) {
          // add trailing slash
          mount = mount+'/';
        }
        $(".custom-parse-server-mount").html(mount);
        if (typeof(Storage) !== "undefined") {
          localStorage.setItem('parse-server-custom-mount', mount);
        }
      });

      // set protocol listener
      $('#parse-server-custom-protocol').change(function() {
        const protocol = $('#parse-server-custom-protocol').val();
        if(!protocol.match(/^[a-z]+$/)) {
          // not a valid protocol
          return;
        }
        $(".custom-parse-server-protocol").html(protocol);
        if (typeof(Storage) !== "undefined") {
          localStorage.setItem('parse-server-custom-protocol', protocol);
        }
      });

      // set appId listener
      $('#parse-server-custom-appid').keyup(function() {
        var appId = $('#parse-server-custom-appid').val();
        if(!appId.match(/^[^\s]+$/i)) {
          // not a valid appId
          return;
        }
        // encode any html
        appId = appId.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        $(".custom-parse-server-appid").html(appId);
        if (typeof(Storage) !== "undefined") {
          localStorage.setItem('parse-server-custom-appid', appId);
        }
      });

      // set masterKey listener
      $('#parse-server-custom-masterkey').keyup(function() {
        var masterKey = $('#parse-server-custom-masterkey').val();
        if(!masterKey.match(/^[^\s]+$/i)) {
          // not a valid masterKey
          return;
        }
        // encode any html
        masterKey = masterKey.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        $(".custom-parse-server-masterkey").html(masterKey);
        if (typeof(Storage) !== "undefined") {
          localStorage.setItem('parse-server-custom-masterkey', masterKey);
        }
      });

      // set clientKey listener
      $('#parse-server-custom-clientkey').keyup(function() {
        var clientKey = $('#parse-server-custom-clientkey').val();
        if(!clientKey.match(/^[^\s]+$/i)) {
          // not a valid clientKey
          return;
        }
        // encode any html
        clientKey = clientKey.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        $(".custom-parse-server-clientkey").html(clientKey);
        if (typeof(Storage) !== "undefined") {
          localStorage.setItem('parse-server-custom-clientkey', clientKey);
        }
      });

      // set restApiKey listener
      $('#parse-server-custom-restapikey').keyup(function() {
        var restApiKey = $('#parse-server-custom-restapikey').val();
        if(!restApiKey.match(/^[^\s]+$/i)) {
          // not a valid restApiKey
          return;
        }
        // encode any html
        restApiKey = restApiKey.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        $(".custom-parse-server-restapikey").html(restApiKey);
        if (typeof(Storage) !== "undefined") {
          localStorage.setItem('parse-server-custom-restapikey', restApiKey);
        }
      });

      // set reset button
      $('#parse-server-custom-values-reset').click(function() {
        // reset defaults
        let _default = $("#parse-server-custom-url").attr('defaultval');
        $(".custom-parse-server-url").html(_default);
        $("#parse-server-custom-url").val(_default);
        localStorage.setItem('parse-server-custom-url', _default);

        _default = $("#parse-server-custom-mount").attr('defaultval');
        $(".custom-parse-server-mount").html("/"+_default+"/");
        $("#parse-server-custom-mount").val(_default);
        localStorage.setItem('parse-server-custom-mount', "/"+_default+"/");

        _default = $("#parse-server-custom-protocol").attr('defaultval');
        $(".custom-parse-server-protocol").html(_default);
        $("#parse-server-custom-protocol").val(_default);
        localStorage.setItem('parse-server-custom-protocol', _default);

        _default = $("#parse-server-custom-appid").attr('defaultval');
        $(".custom-parse-server-appid").html(_default);
        $("#parse-server-custom-appid").val(_default);
        localStorage.setItem('parse-server-custom-appid', _default);

        _default = $("#parse-server-custom-masterkey").attr('defaultval');
        $(".custom-parse-server-masterkey").html(_default);
        $("#parse-server-custom-masterkey").val(_default);
        localStorage.setItem('parse-server-custom-masterkey', _default);

        _default = $("#parse-server-custom-clientkey").attr('defaultval');
        $(".custom-parse-server-clientkey").html(_default);
        $("#parse-server-custom-clientkey").val(_default);
        localStorage.setItem('parse-server-custom-clientkey', _default);

        _default = $("#parse-server-custom-restapikey").attr('defaultval');
        $(".parse-server-custom-restapikey").html(_default);
        $("#parse-server-custom-restapikey").val(_default);
        localStorage.setItem('parse-server-custom-restapikey', _default);
      });

    },

		// we recalculate the header heights for the TOC
		// highlighting when the height of the content changes
		handleToggleChange: function() {
			this.toc && this.toc.updateHeights();
		},

		handleSelectChange: function(e) {
			location.href = this.mobileToc.selectedOptions[0].getAttribute('data-anchor');
		},

		handleWindowResize: function(e) {
			this.toc && this.toc.updateHeights();
		}
	};

	_.extend(Docs.prototype, UI.ComponentProto);

})(UI, _);

var platform = window.location.pathname.split('/')[1];
if (platform) {
  new App.Views.Docs.Main({
    language: 'en',
    platform: platform
  });
}

$(function() {
  echo.init({
    offset: 2500,
    throttle: 250,
    unload: false,
    callback: function (element, op) {
      //console.log(element, 'has been', op + 'ed')
    }
  });
});
