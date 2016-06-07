$(document).on('click', '.archiveNotification', function () {
    var that = $(this);
    var notificationId = $(that).attr("id");

    $.ajax({
        type: 'GET',
        url: '/api/contact/archivenotification/' + notificationId,
        success: function (result) {
            if (result.statusCode == 200) {
                $(that).parent().attr("style", "display:none;");
            }
        },
        error: function (xhr, statusText, err) {
            alert('Server error');
        }
    });
});