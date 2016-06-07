// FORMS conditional inputs
var initFormConditionals = function () {
    $.each($('.js-cFormFieldsetConditional'), function (index, el) {
        var $sendee = $(el);
        $sendee.find('input').attr('disabled', true);
        var selector = $sendee.data('conditional-selector');
        var requiredValue = $sendee.data('conditional-value');
        var $sender = $(selector);
        $sender.on('change', function (ev) {
            $sendee.removeClass('cFormFieldsetConditionalActive').find('input').attr('disabled', true);
            if (this.value === requiredValue && this.value) {
                $sendee.addClass('cFormFieldsetConditionalActive').find('input').attr('disabled', false);
            }
        });
    });
}

$(document).ready(function () {

    initFormConditionals()

});
