/* smooth scrolling for nav sections */
$('a').click(function(){
    $('html, body').animate({
        scrollTop: $( $(this).attr('href') ).offset().top -80
    }, 500);
    return false;
});
