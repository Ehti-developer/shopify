$(document).ready(function () {
    $('.product-slider').owlCarousel({
        loop:true,
        margin:10,
        nav:true,
        dots:false,
        items:4,
      responsive:{
        0:{
            items:1,
            nav:false,
            dots:true,
        },
        600:{
            items:2,
             nav:false,
            dots:true,
        },
        767:{
           items:2,
           nav:true,
           dots:false, 
        },
        1000:{
            items:4,
        }
    }
       
    });
});
$(document).ready(function () {
    $('.testimonial-slider').owlCarousel({
        loop:true,
        margin:20,
        nav:true,
        dots:false,
        items:3,
      responsive:{
        0:{
            items:1,
        },
        767:{
            items:2,
        },
        1200:{
            items:3,
        }
    }
       
    });
});