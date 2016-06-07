/* 040-publish/behaviours.js */
/* STYLEGUIDE UI EVENTS */

var codeToggle = function () {
    document.querySelector('.js-style-body').delegateEventListener('click', '.js-style-toggle', function (ev) {
        ev.stopPropagation();
        this.classList.toggle('style-toggle__open');
    });
}

var navClick = function () {
    document.querySelector('.js-style-nav-menu').delegateEventListener('click', '.js-style-nav-link', function (ev) {
        ev.stopPropagation();
        this.classList.toggle('style-toggle__open');
        var parser = document.createElement('a');
        parser.href = this.href;
        var key = parser.hash.replace('#sg', '');
        stylePrintHtml(key)
    });
}