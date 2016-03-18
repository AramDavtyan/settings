
<!DOCTYPE html>
  <head>
    <style>
      * {
        -webkit-box-sizing: border-box;
        -moz-box-sizing: border-box;
        box-sizing: border-box;
      }
      #fh5co-offcanvass {
        position: fixed;
        z-index: 88;
        top: 0;
        right: 0;
        -webkit-transition: 0.3s;
        -o-transition: 0.3s;
        transition: 0.3s;
        -webkit-transform: translateX(320px);
        -moz-transform: translateX(320px);
        -ms-transform: translateX(320px);
        -o-transform: translateX(320px);
        transform: translateX(320px);
        bottom: 0;
        width: 300px;
        padding: 40px 30px;
        background: #fff;
        -webkit-box-shadow: 0 0 9px 0 rgba(0, 0, 0, 0.3);
        -moz-box-shadow: 0 0 9px 0 rgba(0, 0, 0, 0.3);
        -ms-box-shadow: 0 0 9px 0 rgba(0, 0, 0, 0.3);
        box-shadow: 0 0 9px 0 rgba(0, 0, 0, 0.3);
      }
      #fh5co-offcanvass.fh5co-awake {
        -webkit-transform: translateX(0px);
        -moz-transform: translateX(0px);
        -ms-transform: translateX(0px);
        -o-transform: translateX(0px);
        transform: translateX(0px);
      }
    </style>



    <script src="http://freehtml5.co/demos/hydrogen/js/jquery.min.js"></script>
    <script type="text/javascript">
      $(function() {
        /*OffCanvass*/
        var offCanvass = function() {
          $('body').on('click', '.js-fh5co-menu-btn, .js-fh5co-offcanvass-close', function(){
            $('#fh5co-offcanvass').toggleClass('fh5co-awake');
          });
        };

        var mobileMenuOutsideClick = function() {
          $(document).click(function (e) {
            var container = $("#fh5co-offcanvass, .js-fh5co-menu-btn");
            if (!container.is(e.target) && container.has(e.target).length === 0) {
              if ( $('#fh5co-offcanvass').hasClass('fh5co-awake') ) {
                $('#fh5co-offcanvass').removeClass('fh5co-awake');
              }
            }
          });
        };
        $(function(){
          offCanvass();
        });
        /*OffCanvass*/
      });
    </script>
  </head>
  <body>

  <div id="fh5co-offcanvass">
    <a href="#" class="fh5co-offcanvass-close js-fh5co-offcanvass-close">Menu <i class="icon-cross"></i> </a>
    <h1 class="fh5co-logo"><a class="navbar-brand" href="index.html">Hydrogen</a></h1>
    <ul>
      <li class="active"><a href="index.html">Home</a></li>
      <li><a href="about.html">About</a></li>
      <li><a href="pricing.html">Pricing</a></li>
      <li><a href="contact.html">Contact</a></li>
    </ul>
    <h3 class="fh5co-lead">Connect with us</h3>
    <p class="fh5co-social-icons">
      <a href="#"><i class="icon-twitter"></i></a>
      <a href="#"><i class="icon-facebook"></i></a>
      <a href="#"><i class="icon-instagram"></i></a>
      <a href="#"><i class="icon-dribbble"></i></a>
      <a href="#"><i class="icon-youtube"></i></a>
    </p>
  </div>
  <header id="fh5co-header" role="banner">
    <div class="container">
      <div class="row">
        <div class="col-md-12">
          <a href="#" class="fh5co-menu-btn js-fh5co-menu-btn">Menu <i class="icon-menu"></i></a>
        </div>
      </div>
    </div>
  </header>
  </body>
</html>
