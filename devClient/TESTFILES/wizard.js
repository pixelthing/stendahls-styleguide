$(document).ready(function () {

    setTimeout(function () {
        $('.js-wizardTrack').addClass('sliderListAnimate');
    }, 500)

    var notifyOfSaving = function () {
        $('.js-wizardSortable').addClass('wizardSortableSaveSaving');
    }
    var notifyOfSaved = function () {
        $('.js-wizardSortable').removeClass('wizardSortableSaveSaving').addClass('wizardSortableSaveSaved').delay('500').removeClass('wizardSortableSaveSaved');
    }
    var notifyOfError = function () {
        $('.js-wizardSortable').removeClass('wizardSortableSaveSaving').addClass('wizardSortableSaveError').delay('500').removeClass('wizardSortableSaveError');
    }
    var sortableSave = function () {

        var sorted = $(".js-wizardSortableItem");
        var id = "";
        var first = true;
        $(".js-wizardSortableItem").each(function (index) {
            if (!$(this).hasClass('removed')) {
                if (first) {
                    id += '?id=' + $(this).attr("id");
                    first = false;
                } else {
                    id += '&id=' + $(this).attr("id");
                }
            }
        });

        notifyOfSaving();
        $.ajax({
            type: 'GET',
            url: '/api/contact/updatecontactspreferredcategories/' + id,
            success: function (msg) {
                notifyOfSaved();
                ga('send', 'event', 'wizard', 'preferred categories');
            },
            error: function (xhr, statusText, err) {
                ga('send', 'exception', {
                    'exDescription': err,
                    'exFatal': false,
                    'appName': 'vhnApp.wizard.sortableSave'
                });
            }
        });
    }

    if ($(".js-wizardSortable").length) {
        $(".js-wizardSortable").sortable({
            cursorAt: { left: 5 },
            onDrop: function ($item, container, _super) {

                $item.find(".js-wizardSortable").sortable('enable')
                _super($item, container)

                sortableSave();
            }
        });
    }

    $('.js-wizardSortableClose').on("click", function () {
        var that = $(this);
        var nav = that.closest('.js-wizardSortableItem');

        if (nav.hasClass('removed')) {
            nav.removeClass('removed');
            that.removeClass('iconAdd');
            that.addClass('iconClose');
        } else {
            nav.addClass('removed');
            that.removeClass('iconClose');
            that.addClass('iconAdd');
        }
        sortableSave();
    });

    // By default, turn off the "do you want to see the wizard the next time you log-in"
    $('.showWizardOnStart').on('click', function () {
        var isChecked = "?isChecked=" + $('#showWizardOnStart').is(':checked');
        $.ajax({
            type: 'GET',
            url: '/api/contact/showwizardonstart/' + isChecked,
            success: function (msg) {
            },
            error: function (xhr, statusText, err) {
                ga('send', 'exception', {
                    'exDescription': err,
                    'exFatal': false,
                    'appName': 'vhnApp.wizard.showWizardOnStart'
                });
            }
        });
    });

    $('.js-wizardButtonClose').click(function () {
        $('.js-wizardButtonForm').addClass('wizardButtonFormSubmitted');
    });

});

vhnApp.controller('WizardController', ['$scope', '$timeout', function ($scope, $timeout) {

    // on entering the last slide, "manually" turn off the "return to wizard" checkbox, if it's on.
    // It's this weird "manual triggered event" to send the ajax response back to server, while alerting the user to teh change and giving them a chance to change it.
    $scope.$watch('currentPosition', function (newValue, oldValue) {
        if (oldValue !== 4 && newValue === 4) {
            $timeout(function () {
                var checked = $('.js-showWizardOnStart')[0].checked;
                if (checked) {
                    $('.js-showWizardOnStart').trigger('click');
                }
            },600);
        }
    })

}]);
