

$(document).on('click', '.js-unbookOrBookUserFromEvent', function () {
    var that = $(this);
    var oldText = that.html();
    var stateText = that.parent().parent().find(".js-participantState");
    var userId = that.attr("id");
    var eventId = that.parent().find(".eventId").val();
    var stateColor = that.parent().parent().find(".eventAttendeeListIcon");
    if (userId != null && eventId != null) {
        var state = $(that).attr("data");
        $.ajax({
            method: 'GET',
            url: '/api/event/setstate/' + eventId + '/' + userId + '/' + state
        }).success(function (response) {
            $(that).html(response.button);

            var text = response.text;
            $(stateText).html(text.state + " av " + text.invitedByInitials);
            stateColor.attr("class", "cAvatar eventAttendeeListIcon eventAttendeeListIcon-" + response.stateColor);
        }).error(function (e) {
            ga('send', 'exception', {
                'exDescription': e.message,
                'exFatal': false,
                'appName': 'vhnApp.EventListController.SetState' + '/' + state
            });
        });
    }
});

$(document).on('click', '.js-optionsParticipants', function () {
    var that = $(this);
    var eventId = $(that).attr('data-eventid');
    var userId = $(that).attr('data-participantid');
    var index = $(that).attr('data-index');
    var url = '/event/GetEventOptionsForUser/' + eventId + '/' + userId;
    var target = $(that).attr('data-target');

    if (eventId != null && userId != null) {
        $("#optionWrapper").load(url, function () {
            $(target).modal("show");
            $(target).find("#index").val(index);
        });
    }
});

$(document).on('click', '.js-mailParticipants', function () {

    var that = $(this);
    var eventId = that.attr('data-eventid');
    var stateId = that.attr('data-stateid');
    var target = that.attr('data-target');
    var url = '/event/GetMailFormForEvent/' + eventId + '/' + stateId;


    if (eventId != null) {
        $(document).find("#mailParticipantsWrapper").load(url, function () {
            $(target).modal("show");
        });
    }
});
$(document).on('click', '#overrideSend', function () {
    $("#notNotifiedParticipants").toggle();
    $("#allParticipantsInList").toggle();
});



$(document).on('focus', '.js-changeMandatoryOption', function () {
    var theValue = $(this).val();
    $(this).attr("data-oldValue", theValue);
});

$(document).on('change', '.js-changeMandatoryOption', function () {
    var that = $(this);
    var eventId = that.attr('data-eventid');
    var participantId = that.attr("data-participantId");
    var selectedOption = that.find(":selected").text();
    var index = that.val();
    var type = that.attr('data-type');
    var saveText = that.closest('.js-eventAttendeeOption').find(".js-saveText");
    var optionId = that.attr('data-optionId');
    var currentSingelNum = $("#currentSingleNum_" + eventId);
    var currentDoubleNum = $("#currentDoubleNum_" + eventId);
    var currentPartOfDoubleNum = $("#currentPartOfDoubleNum_" + eventId);

    var currentNoAccomodation = $("#currentNoAccomodation_" + eventId);

    if (selectedOption == '' || selectedOption == ' ') {
        selectedOption = 'null';
    }
    var previousValue = $(this).attr("data-oldValue");

    saveText.show();

    $.ajax({
        type: 'POST',
        url: '/api/event/updateparticipantoptionanswerbyid/' + eventId + '/' + participantId + '/' + index + '/' + optionId + "/" + type + "/" + selectedOption
    }).success(function (response) {

        if (type == "sleeping") {
            if (response.message != '') {
                saveText.hide();
                that.val(previousValue);
                alert(response.message);
            } else {
                saveText.hide();
                var num = 0;
                if (index == 1) {
                    num = 1;
                }
                if (index == 2) {
                    num = 1;
                }
                if (index == 0) {
                    num = -1;
                }

                currentSingelNum.html(response.data.currentNumOfSinglesRoom);
                currentDoubleNum.html(response.data.currentNumOfDoubleRoom);
                currentPartOfDoubleNum.html(response.data.currentNumOfPartInDoubleRoom);
                currentNoAccomodation.html(response.data.currentNumOfNoAccomodations);
                that.attr("data-oldValue", index);
            }
        }

    }).error(function (xhr, statusText, err) {
        alert('Server error');
    });

});

$(document).on('focusout', '.js-freetextoption', function () {
    var that = $(this);
    var eventId = that.attr('data-eventid');
    var participantId = that.attr("data-participantId");
    var selectedOption = that.val();
    var type = 'freetext';
    var saveText = that.closest('.js-eventAttendeeOption').find(".js-saveText");
    var optionId = that.attr('data-optionId');

    saveText.show();

    $.ajax({
        type: 'POST',

        url: '/api/event/updateparticipantoptionanswerbyid/' + eventId + '/' + participantId + '/0/' + optionId + "/" + type + "/" + selectedOption
    }).success(function (response) {
        saveText.hide();
    }).error(function (xhr, statusText, err) {
        saveText.hide();
        alert('Server error');
    });

});