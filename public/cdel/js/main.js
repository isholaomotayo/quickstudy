/* =====================================
Template Name: Learnedu
Author Name: iThemer
Author URI: http://ithemer.com/
Description: Learnedu is a Education & Courses Template.
Version:	1.0
========================================*/
/*=======================================
[Start Activation Code]
=========================================
* Sticky Header JS
* Mobile Menu JS
* Slider Active JS
* Circle Progress JS
* Testimonial Slider JS
* CounterUp JS
* Faqs JS
* Video Popup JS
* Blog Slider JS
* Masonry JS
* Parallax JS
* Wow JS
* Scroll JS
* Scroll Up JS
* Preloader JS
=========================================
[End Activation Code]
=========================================*/

(function($) {
  "use strict";
  $(document).on("ready", function() {
    /*====================================
			Sticky Header JS
		======================================*/

    jQuery(window).on("scroll", function() {
      if ($(this).scrollTop() > 100) {
        $(".header").addClass("sticky");
      } else {
        $(".header").removeClass("sticky");
      }
    });

    /*====================================
			Mobile Menu JS
		======================================*/

    $(".menu").slicknav({
      prependTo: ".mobile-menu",
      duration: 600,
      closeOnClick: true,
    });

    /*====================================
			Slider Active JS
		======================================*/

    $(".slider-active").owlCarousel({
      autoplay: true,
      autoplayTimeout: 3500,
      autoplayHoverPause: true,
      items: 1,
      smartSpeed: 600,
      loop: true,
      merge: true,
      nav: true,
      dots: false,
      navText: [
        '<i class="fa fa-angle-left" aria-hidden="true"></i>',
        '<i class="fa fa-angle-right" aria-hidden="true"></i>',
      ],
      responsive: {
        300: {
          nav: false,
        },
        768: {
          nav: false,
        },
        1170: {
          nav: true,
        },
      },
    });

    /*====================================
			Circle Progress JS
		======================================*/

    $(".circle").circleProgress({
      fill: {
        color: "#00B16A",
      },
    });

    /*====================================
			Course Slider JS
		======================================*/

    $(".course-slider").owlCarousel({
      items: 3,
      autoplay: true,
      autoplayTimeout: 3500,
      smartSpeed: 600,
      autoplayHoverPause: true,
      margin: 25,
      loop: true,
      merge: true,
      dots: false,
      nav: true,
      navText: [
        '<i class="fa fa-angle-left" aria-hidden="true"></i>',
        '<i class="fa fa-angle-right" aria-hidden="true"></i>',
      ],
      responsive: {
        300: {
          items: 1,
          nav: false,
        },
        480: {
          items: 2,
          nav: false,
        },
        768: {
          items: 2,
          nav: false,
        },
        1170: {
          items: 3,
        },
      },
    });

    /*====================================
			Testimonial Slider JS
		======================================*/

    $(".testimonial-slider").owlCarousel({
      autoplay: true,
      autoplayTimeout: 3500,
      smartSpeed: 600,
      autoplayHoverPause: true,
      margin: 25,
      loop: true,
      merge: true,
      center: false,
      nav: true,
      dots: false,
      navText: [
        '<i class="fa fa-angle-left" aria-hidden="true"></i>',
        '<i class="fa fa-angle-right" aria-hidden="true"></i>',
      ],
      responsive: {
        300: {
          items: 1,
          nav: false,
        },
        480: {
          items: 2,
          nav: false,
        },
        768: {
          items: 2,
          nav: false,
        },
        1170: {
          items: 2,
        },
      },
    });

    /*====================================
			Events Slider JS
		======================================*/

    $(".event-slider").owlCarousel({
      autoplay: true,
      autoplayTimeout: 3500,
      smartSpeed: 600,
      autoplayHoverPause: true,
      margin: 25,
      loop: true,
      merge: true,
      nav: true,
      dots: false,
      navText: [
        '<i class="fa fa-angle-left" aria-hidden="true"></i>',
        '<i class="fa fa-angle-right" aria-hidden="true"></i>',
      ],
      responsive: {
        300: {
          items: 1,
          nav: false,
        },
        480: {
          items: 2,
          nav: false,
        },
        768: {
          items: 2,
          nav: false,
        },
        1170: {
          items: 3,
        },
      },
    });

    /*====================================
			Event Gallery JS
		======================================*/

    $(".event-gallery").owlCarousel({
      items: 1,
      autoplay: false,
      autoplayTimeout: 3500,
      smartSpeed: 600,
      autoplayHoverPause: true,
      animateOut: "fadeOut",
      animateIn: "fadeIn",
      margin: 0,
      loop: true,
      merge: true,
      nav: true,
      navText: [
        '<i class="fa fa-angle-left" aria-hidden="true"></i>',
        '<i class="fa fa-angle-right" aria-hidden="true"></i>',
      ],
      dots: false,
    });

    /*====================================
			CounterUp JS
		======================================*/

    $(".counter").counterUp({
      delay: 10,
      time: 4000,
    });

    /*====================================
			Blog Slider JS
		======================================*/

    $(".blog-slider").owlCarousel({
      items: 2,
      autoplay: false,
      autoplayTimeout: 3500,
      smartSpeed: 600,
      autoplayHoverPause: true,
      margin: 15,
      loop: true,
      merge: true,
      nav: true,
      navText: [
        '<i class="fa fa-angle-left" aria-hidden="true"></i>',
        '<i class="fa fa-angle-right" aria-hidden="true"></i>',
      ],
      dots: true,
      responsive: {
        300: {
          items: 1,
          nav: false,
        },
        480: {
          items: 2,
          nav: false,
        },
        768: {
          items: 2,
          nav: false,
        },
        1170: {
          items: 3,
        },
      },
    });

    /*====================================
			Blog Slider JS
		======================================*/

    $(".b-gallery").owlCarousel({
      items: 1,
      autoplay: false,
      autoplayTimeout: 3500,
      smartSpeed: 600,
      autoplayHoverPause: true,
      animateOut: "fadeOut",
      animateIn: "fadeIn",
      margin: 0,
      fade: true,
      loop: true,
      merge: true,
      nav: true,
      navText: [
        '<i class="fa fa-angle-left" aria-hidden="true"></i>',
        '<i class="fa fa-angle-right" aria-hidden="true"></i>',
      ],
      dots: false,
    });

    /*====================================
			Faqs JS
		======================================*/

    $(".panel").on("click", function() {
      $(".panel").removeClass("active");
      $(this).addClass("active");
    });

    /*=====================================
			Video Popup
		======================================*/

    $(".video-popup").magnificPopup({
      type: "iframe",
      removalDelay: 300,
      mainClass: "mfp-fade",
    });

    /*====================================
			Masonry JS
		======================================*/

    $(".masonry").masonry({
      // options
      itemSelector: ".grid-item",
    });

    /*=====================================
			Parallax JS
		======================================*/

    $(window).stellar({
      responsive: true,
      positionProperty: "position",
      horizontalOffset: 0,
      verticalOffset: 0,
      horizontalScrolling: false,
    });

    /*====================================
			Wow JS
		======================================*/

    var window_width = $(window).width();
    if (window_width > 767) {
      new WOW().init();
    }

    /*=====================================
			Scroll Up JS
		======================================*/
    // $.scrollUp({
    // 	scrollName: 'scrollUp',      // Element ID
    // 	scrollDistance: 300,         // Distance from top/bottom before showing element (px)
    // 	scrollFrom: 'top',           // 'top' or 'bottom'
    // 	scrollSpeed: 1000,            // Speed back to top (ms)
    // 	animation: 'fade',           // Fade, slide, none
    // 	animationSpeed: 200,         // Animation speed (ms)
    // 	scrollTrigger: false,        // Set a custom triggering element. Can be an HTML string or jQuery object
    // 	scrollTarget: false,         // Set a custom target element for scrolling to. Can be element or number
    // 	easing: 'easeInOutQuart',
    // 	scrollText: ["<i class='fa fa-angle-up'></i>"], // Text for element, can contain HTML
    // 	scrollTitle: false,          // Set a custom <a> title if required.
    // 	scrollImg: false,            // Set true to use image
    // 	activeOverlay: false,        // Set CSS color to display scrollUp active point, e.g '#00FFFF'
    // 	zIndex: 2147483647           // Z-Index for the overlay
    // });
  });

  /*=====================================
			Preloader JS
		======================================*/

  // $(window).on("load", function() {
  //   $(".book_preload").fadeOut("slow", function() {
  //     $(this).remove();
  //   });
  // });
})(jQuery);
/*
     FILE ARCHIVED ON 17:31:48 Apr 14, 2019 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 08:20:33 Apr 26, 2020.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  load_resource: 145.877
  PetaboxLoader3.datanode: 123.721 (5)
  exclusion.robots: 0.216
  captures_list: 108.974
  PetaboxLoader3.resolve: 69.377 (3)
  esindex: 0.015
  RedisCDXSource: 0.735
  exclusion.robots.policy: 0.202
  CDXLines.iter: 14.61 (3)
  LoadShardBlock: 89.707 (3)
*/
