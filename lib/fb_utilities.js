(function ($) {

    var fb_user, fb_button_plugin,
        start = function(callback) {

            var $this = this;

            $.ajaxSetup({ cache: true });
            $.getScript('http://connect.facebook.net/en_UK/all.js', function(){
                FB.init({
                  appId: '556665124377404',                 // you need a app in developers.facebook.com to use this and in the site url you should put somthing like http://localhost:8080/exemplo/ 
                  channelUrl: 'http://localhost/blolbsss/', // the channelUrl most be equal to the namespace in app configuration
                  status     : true,                        // check login status
                  xfbml      : true                         // parse XFBML 
                });

                FB.doLogin = function(callback){

                    FB.login(function(response) {
                      if (response.status === 'connected') {
                          fb_user = {"userID": response.authResponse.userID, "accessToken": response.authResponse.accessToken };
                          callback.call($this);
                      }
                    }, {scope: 'publish_stream'});
                };

                FB.checkStatus = function(success_call, error_call){
                    
                    FB.getLoginStatus(function(response) {
                        if (response.status === 'connected') {
                            fb_user = {"userID": response.authResponse.userID, "accessToken": response.authResponse.accessToken };
                            success_call.call($this);
                        } 
                        error_call.call($this, response);
                    });

                    error_call.call($this);
                };

                callback.call($this);   
              });
        },
      
        check_status = function(){
            FB.checkStatus(build_like, build_login);
        },

        build_login = function(){
            fb_login_div = this.html("Login");
            // $("<div class='fb_login'>Login</div>"); // to like this picture
            bind_login_button.call(this);
            //target.append(fb_login_div);
        },

        bind_login_button = function() {

            this.click(function(event){
                event.preventDefault();
                FB.doLogin( build_like);
            });
        },

        bind_like_button = function() {

            var $this = this;

            this.click(function(event){
                event.preventDefault();
                callback( fb_like);
            });
        },

        build_like = function(){
            
            this.html("like");
            check_likes.call(this);
        },

        fb_like = function(){

            var $this = this;

            $.ajax({
                url: 'https:' + '//graph.facebook.com/'+ $this.img_id +'/likes?access_token=' + user.accessToken,
                cache: false,
                method: "post",
                success: function(r){
                    target.html("You like this");
                },
                error: function(r){
                    c_log(r);
                }
            });
        },

        check_likes = function() {

            var $this = this;

            FB.api({
                    method: 'fql.query',
                    query: 'SELECT like_info FROM photo WHERE object_id = ' + $this.img_id
                },
                function(data) {
                    if ( (data[0] && data[0].like_info) ) {

                        if(data[0].like_info.user_likes){
                            $this.html("You and " + (data[0].like_info.like_count - 1) + " like this");
                        } else {
                            $this.html("<div class='bt_like'>Like</div>");
                        }
                    }
                }
            );
        };

    fb_button_plugin = function(){
        return this.each(function(){
            var $this = $(this);
            $this  = $.extend($this, {"img_id":0});
        });
    };

    $.fn.update_data = function(img_id){
        
            var $this = $(this);

            $this.img_id = img_id;

            if(fb_user) {
                check_likes.call($this);
            } else { 
            
                start.call($this, check_status);
            }
    };
    

    $.fn.fb_button_plugin = fb_button_plugin;

}(jQuery));
