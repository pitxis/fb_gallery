

$(document).ready(function() {
  $.ajaxSetup({ cache: true });
  $.getScript('http://connect.facebook.net/en_UK/all.js', function(){
    FB.init({
      appId: '556665124377404',
      channelUrl: 'http://localhost/blolbsss/',
      status     : true, // check login status
      xfbml      : true  // parse XFBML
    });     
    $('#loginbutton,#feedbutton').removeAttr('disabled');
    FB.login(updateStatusCallback, {scope:'publish_stream'});
  });


});


