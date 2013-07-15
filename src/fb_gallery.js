(function ($) {
    "use strict";
    $.support.cors = true;
    var log = ((c_log) ? c_log : alert), paging = {},
        private_methods = {

            get_fb : function(albumId, user_id, callB, p_url) {
                
                var $this = this;
                p_url = ((p_url === undefined) ? 'https:' + '//graph.facebook.com/' + albumId + '/photos?limit=1' : p_url);

                $.ajax({
                    url: p_url,
                    cache:false,
                    dataType: 'Json',
                    success: function (result) {
                        if ((result && result.data) && result.data.length > 0) { 
                            var data = private_methods.parse_fb(result);
                            private_methods[callB].call($this, data);
                            private_methods.checkLike.call($this, user_id, data.imgs.id, data.imgs.likes);
                        } else {
                            private_methods.error_handler("Sorry, no results found!!!");
                        }
                    },
                    beforeSend: function () {
                        private_methods.cooltransition($this);
                    },
                    error: function(error) {
                       var err = ((error.responseJSON && error.responseJSON.error) ? error.responseJSON.error.message : "");
                       private_methods.error_handler($this, err);
                    }
                }); 
            },

            error_handler : function(container, message){
                $(".err", container).html("Error while loading new image");
                log(message);
            },

            parse_fb : function (json) {
                var img, obj = json.data[0],
                    next = ((json.paging && json.paging.next) ? json.paging.next : undefined),
                    before = ((json.paging && json.paging.previous) ? json.paging.previous : undefined);

                img = {
                    "id": obj.id,
                    "pic": obj.source,
                    "likes": ((obj.likes && obj.likes.data) ? obj.likes.data : undefined),
                    "name": ((obj.name || "undifined") ? obj.name : undefined)
                };

                return {"imgs": img, "paging": {'before' : before, 'next': next}};
            },
            
            construct: function (data) {

                var big_pic = $("<div class='bigPic'>"),
                    img = data.imgs;
 
                paging = data.paging;

                big_pic.append("<div class='bp_right_arrow' idx='0'" + ((data.paging.next) ? "" : "style='display:none'" )  + " ><img src='../assets/arrow.png' /></div>");
                big_pic.append("<div class='bp_left_arrow' style='display:none' idx='0'><img src='../assets/arrow.png'  /></div>");
                big_pic.append("<div class='bp_title'><div class='bp_name'>" + img.name + "</div><div class='fb_like'></div>");
                big_pic.append($("<img class='bigPic_img' src='" + img.pic + "' style='max-width:" + this.width() + "px' />"));
                big_pic.append($(".err", this));
                this.html(big_pic);
                private_methods.bindButtons.call(this);
            },

            addIconsAndBigPic: function(data) {
                
                var img = data.imgs, $this = this, 
                    elem_img = $(".bigPic_img", this);

                paging = data.paging;

                
                if (!($._data($(".bigPic_img")[0], "events") && $._data($(".bigPic_img")[0], "events")["load"])) {
                    elem_img.load(function(){
                        elem_img.animate({
                            opacity: 1
                        },500, function() {
                            $(".bp_name", $this).html( ((img.name) ? img.name : "") );
                            $(".bt_like", $this).attr("ph_id", img.id);
                            $(".num_likes", $this).html( ((img.likes) ? img.likes.length : 0) );
                            
                            if (paging.next) {
                                c_log(".bp_right_arrow show");
                                $(".bp_right_arrow", $this).show();
                            } else {
                                $(".bp_right_arrow", $this).hide();
                            }

                            if (paging.before) {
                                c_log(".bp_left_arrow show");
                                $(".bp_left_arrow", $this).show();
                            } else {
                                $(".bp_left_arrow", $this).hide();
                            }
                            
                       });
                    });
                }
                elem_img.attr("src", img.pic);
            },

            checkLike: function(user_id, img_id, likes){

                var tmp_div = $("<div class='bt_like' ph_id='" + img_id +"'>Like</div><div class='num_likes'>" + ((likes) ? likes.length : 0) + "</div></div>");
                
                if(likes){ 
                    for(var i = 0; i < likes.length; i++){
                        if(likes[i].id === "431470333617993"){
                           tmp_div =  $(tmp_div[0]).html("You and "+ likes.length +" already liked").attr("class", "bt_liked");
                           break;
                        }
                    }
                }
                this.find(".fb_like").html(tmp_div);
            },

            cooltransition: function(container){
            },

            bp_arrows: function(call_side, user_id, caller) {

                var bt = caller, $this = this;
                $this.find("." + bt).hide();

                $(".bigPic_img", this).animate({
                    opacity: 0.25
                },500, function() {
                    if (paging[call_side]) {
                        private_methods.get_fb.call($this, '', user_id, "addIconsAndBigPic", paging[call_side]);
                    }
                });
            },

            fb_like: function(access_token){
                var ph_id = $(".bt_like", this).attr("ph_id");
                var $this = this;

                $.ajax({
                    url: 'https:' + '//graph.facebook.com/'+ ph_id +'/likes?access_token=' + access_token,
                    cache:false,
                    method:"post",
                    success: function(r){
                        c_log(r);
                        var numb = $(".num_likes", $this).html();
                        $(".num_likes", $this).html(++numb);
                    },
                    error: function(r){
                        c_log(r);
                    }
                });
            },

            bindButtons: function() {

                var $this = this;

                $(".bp_right_arrow", $this).click(function(event) {
                    event.preventDefault();
                    $this.trigger('bp_next', "bp_right_arrow");
                });

                $(".bp_left_arrow", $this).click(function(event) {
                    event.preventDefault();
                    $this.trigger('bp_before', "bp_left_arrow");
                });

                $(".bt_like", $this).click(function(event) {
                    event.preventDefault();
                    $this.trigger('like', $this);
                });
            }
            
        },

        methods = {
            init: function(options) {
                var settings = $.extend({
                    size: 1
                }, options);

                var $this = $(this);
                $this.append($("<div class='err'/></div>"));
                
                if(!(settings.albumId && settings.size) || 
                    (typeof settings.size !== 'number' && settings.size % 1 != 0) || 
                    !(settings.fb_result && settings.fb_result.userID && settings.fb_result.accessToken ) )  {
                    
                    $(".err", $this).html("Options error");
                    return; 
                }

                return this.each(function(){
                    var $this = $(this);
                    $this.bind({
                        'bp_next':   function() { private_methods.bp_arrows.call($this, "next", settings.fb_result.userID, arguments[1]); },
                        'bp_before': function() { private_methods.bp_arrows.call($this, "before", settings.fb_result.userID, arguments[1]); },
                        'like': function() { private_methods.fb_like.call($this, settings.fb_result.accessToken); }
                    });
                    
                    c_log(settings.fb_result);
                    private_methods.get_fb.call($this, settings.albumId, settings.fb_result.userID, "construct");
                });
            },

            destroy: function() {
                $(this).html(" ");
            }
        };

        $.fn.fb_gallery = function (method) {
            if (methods[method]) {
                return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
            } else if (typeof method === 'object' || !method) {
                return methods.init.apply(this, arguments);
            } else {
                $.error('Method ' + method + ' does not exist on jQuery.galeria');
           }
    };
}(jQuery));