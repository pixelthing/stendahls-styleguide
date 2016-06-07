vhnApp.directive('vhnTextHeight', function ($compile) {
    return function (scope, element, attrs) {
        setTimeout(function () {
            var elementHeight = $(element).outerHeight();
            var elementlineHeight = $(element).css('line-height');
            // chrome reports line-height as 18px
            if (elementlineHeight.indexOf('px') >= 0) {
                elementlineHeight = parseInt(elementlineHeight);
            // IE9 reports line-height as 1.2
            } else {
                var elementFontHeight = $(element).css('font-size');
                if (elementFontHeight.indexOf('em') >= 0) {
                    elementlineHeight = parseInt(elementlineHeight) * 16;
                } else {
                    elementlineHeight = parseInt(elementlineHeight) * parseInt(elementFontHeight);
                }
            }
            var button = $('<a class="vhnTallTextToggle js-vhnTallTextToggle"><span class="vhnTallTextToggleMore">Mer...</span><span class="vhnTallTextToggleLess">Mindre...</span></a>');
            if (elementHeight > (elementlineHeight * 5)) {
                $(element).addClass('vhnTallText').after(button);
            }
        }, 1000);
    };
});

$(document).on('click', '.js-vhnTallTextToggle', function (e) {
    e.preventDefault();
    $(this).prev('.vhnTallText').toggleClass('vhnTallTextExpand');
});