$(document).ready(function () {

    if (!$('.js-pContactEditTxtCo').length) {
        return;
    }

    var data = null;
    var sessionCookieName = 'vhnDevDisableSessionStorage';  // used by the developerService, Add "?sessioncacheoff" to url to turn session cache off, add "?sessioncacheon" to url to turn back on
    var localstorageEnabled = false;
    try {
        sessionStorage.setItem(mod, mod);
        sessionStorage.removeItem(mod);
        localstorageEnabled = true;
        // continue
    } catch (e) {
        // nope.
    }

    var BuildMenu = function (data, el) {
        var $this = $(el);
        var dataLength = data.length;
        var buffer = '';
        var currentCompany = $this.attr('data-default');
        var currentGroup = null;
        for (var i = 0; i < dataLength; i++) {
            if (data[i].companyName != currentGroup) {
                if (currentGroup != null) {
                    buffer += '</optgroup>';
                }
                buffer += '<optgroup label="' + data[i].companyName + '">';
                currentGroup = data[i].companyName;
            }
            buffer += '<option value="' + data[i].pageId + '"' + (+currentCompany === +data[i].pageId ? ' selected="selected"' : '') + '>';
            if (data[i].visitCity === null) {
                buffer += data[i].districtNumber + ' ' + (data[i].districtNumber === data[i].centerDistrictNumber ? 'Center' : 'Filial');
            } else {
                buffer += data[i].visitCity + ' (' + data[i].districtNumber + ' ' + (data[i].districtNumber === data[i].centerDistrictNumber ? 'Center' : 'Filial') + ')';
            }
            buffer += '</option>';
        }
        buffer += '</optgroup>';
        $this.append($(buffer));

        var $waiting = $this.find('.js-pContactEditTxtCoWaiting');
        $waiting.text('Lista laddade!');
        setTimeout(function () {
            $waiting.remove();
        }, 2000);

    }

    $.each($('.js-pContactEditTxtCo'),function(index,el) {
    
        var $this = $(el);
        var url = $this.attr('data-url') || '/api/company/geteditabledealers';
        var cookieKey = 'vhn' + url.replace(/^.*[\\\/]/, '');

    // pull dealer data from localstorage
        if (localstorageEnabled && sessionStorage.getItem(cookieKey) !== null && !$cookieStore.get(cookieKey)) {
            data = JSON.parse(sessionStorage.getItem(cookieKey));
        BuildMenu(data);
    // else pull from online
    } else {
        $.ajax({
            type: 'GET',
                url: url,
            success: function (data) {
                    if (localstorageEnabled && !$.cookie(cookieKey)) {
                        sessionStorage.setItem(cookieKey, angular.toJson(data))
                    }
                    if ($.cookie(cookieKey)) {
                        console.log('sessionStorage disabled by dev: dealer list JSON');
                    }
                    BuildMenu(data,el);
            },
            error: function (xhr, statusText, err) { }
        });
    }

    })

    $('.js-pContactEditTxtEmailInput').focusout(function (e) {

        var emailCheck = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;
        var email = $(".js-pContactEditTxtEmailInput").val();

        var test = emailCheck.test(email);

        if (test) {
            $("#submitContactForm").removeAttr("disabled");
            $(".js-pContactEditTxtEmailError").html("");
        } else {
            $(".js-pContactEditTxtEmailError").html("Ange giltig epost!");
            $("#submitContactForm").attr("disabled", "disabled");
        }

    });
});