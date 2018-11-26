(function($) {
  $(function() {
    $(window).scroll(function(e){
      if ($(window).scrollTop() > 10) {
        $('body').addClass('not-in-top');
      } else {
        $('body').removeClass('not-in-top');
      }
    })
  })
}) (jQuery);
