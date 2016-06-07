$(document).ready(function () {

    var imgDataURL = false;
    var imgAngle = 0;

    $('#profilePicture').on('change', function () {

        // reset
        imgDataURL = false;
        $('.js-pContactEditImgInput').removeClass('pContactEditImgInputActive');
        $('.js-pContactEditImgMsg').hide().text("").removeClass('cInfo cError');
        $('.js-pContactEditImgSave').prop("disabled", true);
        $('.js-pContactEditImgThumb').css('background-image', 'none');
        $('.js-pContactEditImgControl').hide();

        // ie9 doesn't support the file API. assume it's ok to upload, and do any error detection server side
        if (!this.files || typeof this.files !== "object") {
            $('.js-pContactEditImgSave').prop("disabled", false);
            return;
        }

        var file = this.files[0];
        if (!file) {
            return;
        }
        $('.js-pContactEditImgInput').addClass('pContactEditImgInputActive');

        // filereader capable: not an image? 
        if (!file.type.match(/image.*/)) {
            $('.js-pContactEditImgMsg').addClass('cError').show().append("Filen är inte en bild.");
            // filereader capable: image too big?
        } else if (file.size > 1048576) {
            $('.js-pContactEditImgSave').attr("disabled", true);
            $('.js-pContactEditImgMsg').addClass('cInfo').show().append("Ändra storlek, var god vänta...");
            imgToResize(file, true);
            // filereader capable: image too ok
        } else {
            $('.js-pContactEditImgMsg').addClass('cInfo').show().append("Filen är redo att ladda upp");
            $('.js-pContactEditImgControl').show();
            $('.js-pContactEditImgSave').prop("disabled", false);
            imgToPreview(file);
        }
    });

    // rotate left and right
    $('.js-pContactEditImgControl').click(function (ev) {
        ev.preventDefault();
        var file = $('.js-pContactEditImgInput')[0].files[0];
        if (!file) {
            return;
        }
        var degrees = $(this).data('rotate');
        $('.js-pContactEditImgMsg').removeClass('cError').addClass('cInfo').text("Roterande bild...");
        if (imgAngle === degrees) {
            imgToResize(file, true, 180);
        } else if (imgAngle !== 0) {
            imgToResize(file, true);
        } else {
            imgToResize(file, true, degrees);
        }

    });

    // on submit
    $('.js-pContactEditImgSave').click(function (ev) {
        ev.preventDefault();
        if (imgDataURL !== false) {
            // get redirectUrl manually from the form
            var redirectUrl = $('.js-pContactEditImgForm #redirectUrl').val();
            var cdsid = $('#cdsid').val();
            imgResizedUpload(redirectUrl, cdsid);
            $('.js-pContactEditImgSpinUpload').show();
            // disable submit button when upload starts
            $('.js-pContactEditImgSave').prop("disabled", true);
            ga('send', 'event', 'wizard', 'submit new image');
        } else if ($('.js-pContactEditImgInput').val()) {
            $('.js-pContactEditImgForm').submit();
            $('.js-pContactEditImgSpinUpload').show();
            // disable submit button when upload starts
            $('.js-pContactEditImgSave').prop("disabled", true);
            ga('send', 'event', 'wizard', 'submit new image');
            return true;
        }
    })

    // preview image before upload
    var imgToPreview = function (file) {

        var img = document.createElement("img");
        var reader = new FileReader();
        reader.onload = function (e) {
            img.src = e.target.result;
            $('.js-pContactEditImgThumb').css('background-image', 'url(' + img.src + ')');
        }
        reader.readAsDataURL(file);

    }

    // resize and preview image before upload
    var imgToResize = function (file, notifyOnCompletion, rotate) {

        var img = document.createElement("img");
        var canvas = document.createElement("canvas");
        var reader = new FileReader();
        reader.onload = function (e) {
            img.src = e.target.result;

            setTimeout(function () {

                var ctx = canvas.getContext("2d");

                var MAX_WIDTH = 800;
                var MAX_HEIGHT = 800;
                var width = img.width;
                var height = img.height;
                //console.log(width + ' x ' + height);

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                canvas.width = width;
                canvas.height = height;

                //console.log(canvas.width + ' x ' + canvas.height);

                var ctx = canvas.getContext("2d");

                if (rotate) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.translate(canvas.width / 2, canvas.height / 2);
                    ctx.rotate(rotate * Math.PI / 180);
                    ctx.drawImage(img, -canvas.width / 2, -canvas.height / 2, width, height);
                    imgAngle = rotate;
                } else {
                    ctx.drawImage(img, 0, 0, width, height);
                    imgAngle = 0;
                }

                imgDataURL = canvas.toDataURL("image/jpeg");

                if (imgDataURL.length > 10) {
                    $('#uploadProfilePicture').prop("disabled", false);
                    $('.js-pContactEditImgControl').show();
                    $('.js-pContactEditImgThumb').css('background-image', 'url(' + imgDataURL + ')');
                    if (notifyOnCompletion) {
                        $('.js-pContactEditImgMsg').text("Filen har ändrat storlek och är redo att ladda upp");
                    } else {
                        return imgDataURL;
                    }
                } else {
                    if (notifyOnCompletion) {
                        $('.js-pContactEditImgMsg').removeClass('cInfo').addClass('cError').text("File ändra storlek misslyckades. Försök en annan bild.");
                    } else {
                        return false;
                    }
                }

            }, 1000); // no idea why, but in safari, this gives the browser time to recognise the image and make it available

        }
        reader.readAsDataURL(file);
    }

    // resize and preview image before upload
    var imgResizedUpload = function (redirectUrl,cdsid) {

        var blobBin = atob(imgDataURL.split(',')[1]);
        var array = [];
        for (var i = 0; i < blobBin.length; i++) {
            array.push(blobBin.charCodeAt(i));
        }

        var file = new Blob([new Uint8Array(array)], { type: 'image/jpeg' });

        var formdata = new FormData();
        formdata.append("cdsid", cdsid);
        formdata.append("file", file);
        formdata.append('redirectUrl', redirectUrl);

        $.ajax({
            url: "/CreateContent/uploadProfilePicture",
            type: "POST",
            data: formdata,
            processData: false,
            contentType: false,
        }).done(function (respond) {
            self.location = redirectUrl;
        });
    }

});