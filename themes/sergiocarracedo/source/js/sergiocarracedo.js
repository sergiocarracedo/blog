(function($) {
  $(function() {
    $(window).scroll(function(e){
      if ($(window).scrollTop() > 10) {
        $('body').addClass('not-in-top');
      } else {
        $('body').removeClass('not-in-top');
      }
    })


    let pswpElement = document.querySelector('.pswp')
    let imgSrcItem = []
    $('img.photoswipe').each(function (index) {
      let imgPath = this.getAttribute('src')
      // caption text
      let alt = $(this).attr('alt')
      let title = $(this).attr('title')
      let captionText = alt || title
      if (captionText) {
        let captionDiv = document.createElement('div')
        captionDiv.className += ' caption'
        let captionEle = document.createElement('b')
        captionEle.className += ' center-caption'
        captionEle.innerText = captionText
        captionDiv.appendChild(captionEle)

        // insert where appropriate
        this.parentElement.insertAdjacentElement('afterend', captionDiv)
      }

      if (this.parentNode.getAttribute('data-size')) {
        let resolution = this.parentNode.getAttribute('data-size').split('x')
        imgSrcItem.push({
          src: imgPath,
          w: resolution[0],
          h: resolution[1],
          title: captionText
        })
      } else {
        imgSrcItem.push({
          src: imgPath,
          w: this.naturalWidth || window.innerWidth,
          h: this.naturalHeight || window.innerHeight,
          title: captionText
        })
      }
    })

    $('img.photoswipe').each(function (i) {
      $(this).click(function (e) {
        let options = {
          index: i, // start at index
          barsSize: {top: 0, bottom: 0},
          captionEl: true,
          fullscreenEl: false,
          shareEl: false,
          bgOpacity: 0.5,
          tapToClose: true,
          tapToToggleControls: true,
          showHideOpacity: false,
          counterEl: true,
          preloaderEl: true,
          history: false,
        }
        console.log(imgSrcItem);
        let gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, imgSrcItem, options)
        gallery.listen('imageLoadComplete', function (index, item) {
          $('img.photoswipe')[index].src = item.src
        })
        gallery.init()
      })
    })

  })
}) (jQuery);
