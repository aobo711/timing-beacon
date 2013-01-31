;(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define('exports', factory);
    } else {
        factory({});
    }
}(function (exports) {

	// 'localStorage' is used for marking the page version, cause it's unreasonable to record all visits, 
	// first visit is good for us
	if(typeof localStorage == 'undefined' || typeof performance == 'undefined' ||!performance.timing){
		return;
	}

	// >>> configuration vars 

	// a small and empty image, CDN cached, better to put a absulote url
    var _beaconImg = '/beacon/blank.gif',

    	// the probability of recording an user's visit, set it 1 if you need to track all of them
        _rate = 1,

        // static version is very important, if you application has 'versions', for example: javascript builded files's version, 
        // a first visit is based on a static version and pathname
        _staticVersion = '',

        // another key element to count a visit
        _storageKey = 's-' + location.pathname,

        metrics = {},
        sended = 0,

        record = function(param){
            (new Image()).src = _beaconImg + '?' + param;
        },

        sendMetrics = function(){
        	var param = '',
                perf = window.performance,
                timing = perf.timing;

                metrics = {
                	// for more metric @see https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/NavigationTiming/Overview.html#sec-navigation-timing-interface

                	// net transforming time in millisecond
                    net : timing.responseEnd - timing.fetchStart,
                    
                    // resource loaded time
                    loaded : timing.loadEventEnd - timing.responseEnd,

                    // net transforming and other resource loaded
                    all : timing.loadEventEnd - timing.navigationStart,

                    // dom ready
                    dom : timing.domComplete - timing.responseEnd
                };
            
            for(var x in metrics){
                param = param + x + '=' + metrics[x] + '&';
            }

            param = param.substr(0, param.length - 1);
            
            record(param);
        },

        init = function () {
            if(Math.random() > _rate){
                return;
            }

            window.addEventListener('load', function(){
                setTimeout(function(){
                	// save static version in localStorage
	                if(sended || ( localStorage.getItem(_storageKey) == _staticVersion)){
	                    return;
	                }

	                sendMetrics();

	                localStorage.setItem(_storageKey, _staticVersion);
	                sended = 1;
                    sendMetrics();

    				exports.metrics = metrics;
    				exports.sended = sended;

                },18);
            });
        };

        init();

}));