
//facebook api jquery start
var fb_start = function(cbck){ 
      
      var callback = cbck, args = arguments;


      $.ajaxSetup({ cache: true });
      $.getScript('http://connect.facebook.net/en_UK/all.js', function(){
          FB.init({
            appId: '556665124377404',                 // you need a app in developers.facebook.com to use this and in the site url you should put somthing like http://localhost:8080/exemplo/ 
            channelUrl: 'http://localhost/blolbsss/', // the channelUrl most be equal to the namespace in app configuration
            status     : true,                        // check login status
            xfbml      : true                         // parse XFBML 
          });

          FB.doLogin = function(callback, args){

              var args = args, $this = this;

              if (FB) { 
                  FB.login(function(response) {callback.call($this, response, args)},{scope:'publish_stream'});
              } else { 
                  console.log("FB is not defined");
              }
          };

          FB.checkStatus = function(){
              
              if (FB) {
                  FB.getLoginStatus(function(response) {
                      if (response.status === 'connected') {
                          return {"userID": response.authResponse.userID, "accessToken": response.authResponse.accessToken };
                      } 
                      return null;
                  });
              } else {
                  console.log("FB is not defined");
                  return null;
              }
          };

          callback.call(args[1].caller, args[1].albumId, args[1].fb_api, args[1].callB);
    });
}



