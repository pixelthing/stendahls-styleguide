$(document).ready(function () {

    var PopOverChecks = function () {
        var popOvers = $('.js-cPeekPopOver');
        var popOversLength = popOvers.length;
        if (popOversLength) {
            var viewportWidth = $(window).width();
            for (var i = 0; i < popOvers.length ; i++) {
                var $this = $(popOvers[i]);
                var offsetLeft = $this.offset().left;
                if ((offsetLeft + 310) > viewportWidth) {
                    $this.addClass('cPeekPopOverLeft');
                } else {
                    $this.removeClass('cPeekPopOverLeft');
                }
                $this.addClass('js-cPeekPopOverReady');
            }
        }
    }

    // init those that are on page at load time
    PopOverChecks();
    // back-up init, for those items that are added to the page post dom-ready. init on mouseoverevent if required (unlikely smooth the first time it's required!).
    $(document).on('mouseover', '.js-cPeekPopOver', function () {
        if (!$(this).hasClass('js-cPeekPopOverReady')) {
            PopOverChecks();
        }
    })
    $(document).on('mouseover', '.js-cPeekPopOverLazy', function () {
        setTimeout(function () {
            $(document).trigger('scroll'); // forces lazyload to paint any missing images
        }, 50);
    })
    // on resize
    $(window).on( 
        'resize', 
        jQuery.throttle( 150, PopOverChecks ) 
    );

});