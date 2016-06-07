// for merging objects
function extend(obj, src) {
    for (var key in src) {
        if (src.hasOwnProperty(key)) obj[key] = src[key];
    }
    return obj;
}

// clone a JS object, don't create a ref to it
function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

$(document).ready(function () {

    $('body').on('click', '*[data-toggleClass]', function () {
        $(this).toggleClass($(this).attr('data-toggleClass'));
    });

    $('body').on('click', '*[data-toggleTarget]', function () {
        var target = $('#' + $(this).attr('data-toggleTarget'));
        target.toggleClass('hidden');
    });

    // <div data-toggle-target-class="element,class"></div>
    $('body').on('click', '[data-toggle-target-class]', function () {
        var values = $(this).data('toggle-target-class').split(',');
        $(values[0]).toggleClass(values[1]);
    });

    $('body').on('click', '[data-toggle-target-attribute]', function () {
        var values = $(this).data('toggle-target-attribute').split(',');
        $(values[0]).prop(values[1], function (idx, oldProp) {
            return !oldProp;
        });
    });

    $('body').on('click', '[data-target-focus]', function () {
        var element = $(this).data('target-focus');
        $(element).select();;
    });

    $('.editListToolsPadding').height($('.editListTools').outerHeight());

    /* HOMEPAGE - AKTUELLT */

    setTimeout(function () {
        $('.js-featuredGridList').addClass('sliderListAnimate');
    }, 100);

    $('.fixedsticky').fixedsticky();

    /* vhnTab interface */

    $(document).on('click', '.js-tabButton', function (ev) {
        ev.preventDefault();
        $this = $(this);
        if (!$this.hasClass('vhnTabButtonActive')) {
            $('.vhnTabButtonActive').removeClass('vhnTabButtonActive');
            $(this).addClass('vhnTabButtonActive');
            var target = $(this).data('tab') || $(this).attr('href');
            $('.cTabContentActive').removeClass('cTabContentActive');
            $(target).addClass('cTabContentActive');
        }
    });

    /* main navigation dropdown menus */
    
    $(document).on('click', '.js-navLauncherLabel', function (ev) {
        var forId = $(this).attr('for');
        $('.js-navLauncherCheckbox').not('#' + forId).prop('checked', false);
    });


    /* jQuery version of dropdown controller */

    $(document).on('click', '.js-dropdownTemp .ddValue', function (ev) {
        ev.stopPropagation();
        ev.preventDefault();
        var $thisDropdown = $(this).closest('.js-dropdownTemp');
        $('.js-dropdownTemp').not($thisDropdown).removeClass('active');
        $thisDropdown.toggleClass('active');
    });
    $(document).on('click', '.js-dropdownTemp .ddOption', function (ev) {
        //ev.stopPropagation();
        //ev.preventDefault();
        $(this).closest('.js-dropdownTemp').toggleClass('active');
    });
    $(document).on('click', function (ev) {
        $('.js-dropdownTemp').removeClass('active');
    });

    /* workflow expand table tab */
    $('.js-workflowActivityTableTabButton').click(function () {
        $(this).closest('.js-workflowActivityTableTab').prev('.js-workflowActivityTable').toggleClass('workflowActivityTableExpanded');
    });

});

