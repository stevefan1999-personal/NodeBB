'use strict';


define('forum/infinitescroll', ['hooks'], function (hooks) {
	var scroll = {};
	var callback;
	var previousScrollTop = 0;
	var loadingMore	= false;
	var container;
	var scrollTimeout = 0;

	scroll.init = function (el, cb) {
		const $body = $('body');
		if (typeof el === 'function') {
			callback = el;
			container = $body;
		} else {
			callback = cb;
			container = el || $body;
		}
		previousScrollTop = $(window).scrollTop();
		$(window).off('scroll', startScrollTimeout).on('scroll', startScrollTimeout);

		if ($body.height() <= $(window).height()) {
			callback(1);
		}
	};

	function startScrollTimeout() {
		if (scrollTimeout) {
			clearTimeout(scrollTimeout);
		}
		scrollTimeout = setTimeout(function () {
			scrollTimeout = 0;
			onScroll();
		}, 60);
	}

	function onScroll() {
		var bsEnv = utils.findBootstrapEnvironment();
		var mobileComposerOpen = (bsEnv === 'xs' || bsEnv === 'sm') && $('html').hasClass('composing');
		if (loadingMore || mobileComposerOpen) {
			return;
		}
		var currentScrollTop = $(window).scrollTop();
		var wh = $(window).height();
		var viewportHeight = container.height() - wh;
		var offsetTop = container.offset() ? container.offset().top : 0;
		var scrollPercent = 100 * (currentScrollTop - offsetTop) / (viewportHeight <= 0 ? wh : viewportHeight);

		var top = 15;
		var bottom = 85;
		var direction = currentScrollTop > previousScrollTop ? 1 : -1;

		if (scrollPercent < top && currentScrollTop < previousScrollTop) {
			callback(direction);
		} else if (scrollPercent > bottom && currentScrollTop > previousScrollTop) {
			callback(direction);
		} else if (scrollPercent < 0 && direction > 0 && viewportHeight < 0) {
			callback(direction);
		}

		previousScrollTop = currentScrollTop;
	}

	scroll.loadMore = function (method, data, callback) {
		if (loadingMore) {
			return;
		}
		loadingMore = true;

		var hookData = { method: method, data: data };
		hooks.fire('action:infinitescroll.loadmore', hookData);

		socket.emit(hookData.method, hookData.data, function (err, data) {
			if (err) {
				loadingMore = false;
				return app.alertError(err.message);
			}
			callback(data, function () {
				loadingMore = false;
			});
		});
	};

	scroll.loadMoreXhr = function (data, callback) {
		if (loadingMore) {
			return;
		}
		loadingMore = true;
		var url = config.relative_path + '/api' + location.pathname.replace(new RegExp('^' + config.relative_path), '');
		var hookData = { url: url, data: data };
		hooks.fire('action:infinitescroll.loadmore.xhr', hookData);

		$.get(url, data, function (data) {
			callback(data, function () {
				loadingMore = false;
			});
		}).fail(function (jqXHR) {
			loadingMore = false;
			app.alertError(String(jqXHR.responseJSON || jqXHR.statusText));
		});
	};

	scroll.removeExtra = function (els, direction, count) {
		if (els.length <= count) {
			return;
		}

		var removeCount = els.length - count;
		if (direction > 0) {
			var height = $(document).height();
			var scrollTop = $(window).scrollTop();

			els.slice(0, removeCount).remove();

			$(window).scrollTop(scrollTop + ($(document).height() - height));
		} else {
			els.slice(els.length - removeCount).remove();
		}
	};

	return scroll;
});
