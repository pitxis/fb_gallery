(function ($) {
    "use strict";
    $.support.cors = true;

    var log = ((c_log) ? c_log : alert), user,
        private_methods = {

            get_fb : function(albumId, fb_api, callB, p_url) {
                
                var $this = this;
                p_url = ((p_url === undefined) ? 'https:' + '//graph.facebook.com/' + albumId + '/photos?limit=1' : p_url);

                $.ajax({
                    url: p_url,
                    cache:false,
                    dataType: 'Json',
                    success: function (result) {
                        if ((result && result.data) && result.data.length > 0) { 
                            var data = private_methods.parse_fb(result);
                            private_methods[callB].call($this, fb_api, data);
                            
                            if(fb_api) {   
                                $(".fb_like", $this).update_data(data.imgs.id, data.imgs.likes);
                            }
                                
                        } else {
                            private_methods.error_handler("Sorry, no results found!!!");
                        }
                    },
                    beforeSend: function () {
                        //private_methods.cooltransition($this);
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
            
            construct: function (fb_api, data) {

                var big_pic = $("<div class='bigPic'>"),
                    img = data.imgs, fb_like_div = "", title_div;
 
                this.paging = data.paging;

                if(fb_api){
                    if($.fn.fb_button_plugin){
                        fb_like_div = $("<div>").attr("class", "fb_like").fb_button_plugin();
                    } else {
                        c_log("No fb_utilities loaded")
                    }
                }

                big_pic.append("<div class='bp_right_arrow' idx='0'" + ((data.paging.next) ? "" : "style='display:none'" )  + " ><img src='../assets/arrow.png' /></div>");
                big_pic.append("<div class='bp_left_arrow' style='display:none' idx='0'><img src='../assets/arrow.png'  /></div>");
                title_div = $("<div class='bp_title'><div class='bp_name'>" + img.name + "</div></div>");
                big_pic.append(title_div.append(fb_like_div));
                big_pic.append($("<img class='bigPic_img' img_id='"+ img.id +"' src='" + img.pic + "' style='max-width:" + this.width() + "px' />"));
                big_pic.append($(".err", this));
                this.html(big_pic);

                private_methods.bindButtons.call(this);
            },

            addIconsAndBigPic: function(fb_api, data) {
                
                var img = data.imgs, $this = this, 
                    elem_img = $(".bigPic_img", this);

                this.paging = data.paging;

                $(".bp_name",$this).html( ( !(img.name) ? "" : img.name) );

                if (!($._data($(".bigPic_img")[0], "events") && $._data($(".bigPic_img")[0], "events")["load"])) {
                    
                    elem_img.load(function(){
                        elem_img.animate({
                            opacity: 1
                        },500, function() {
                            
                            if ($this.paging.next) {
                                c_log(".bp_right_arrow show");
                                $(".bp_right_arrow", $this).show();
                            } else {
                                $(".bp_right_arrow", $this).hide();
                            }

                            if ($this.before) {
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

            bp_arrows: function(fb_api, call_side, caller) {

                var bt = caller, $this = this;
                $this.find("." + bt).hide();

                $(".bigPic_img", this).animate({
                    opacity: 0.25
                },500, function() {
                    if ($this.paging[call_side]) {
                        private_methods.get_fb.call($this, '', fb_api, "addIconsAndBigPic", $this.paging[call_side]);
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
            }
        },

        methods = {
            init: function(options) {
                var settings = $.extend({
                    albumId : "",
                    fb_api: false,
                }, options);

                var $this = $(this), FB = "undefined";

                $this.append($("<div class='err'/></div>"));
                
                if(!settings.albumId) { 
                    $(".err", $this).html("Options error");
                    return; 
                }

                return this.each(function(){
                    var $this = $(this);
                    $this.bind({
                        'bp_next':   function() { private_methods.bp_arrows.call($this, settings.fb_api, "next", arguments[1]); },
                        'bp_before': function() { private_methods.bp_arrows.call($this, settings.fb_api, "before", arguments[1]); },
                        'like': function() { private_methods.fb_like.call($this, arguments[1]); },
                        'login': function() { private_methods.fb_login.call($this, arguments[1]); }
                    });
                    
                    

                    private_methods.get_fb.call($this, settings.albumId, settings.fb_api, "construct");
                    
                });
            }, 

            destroy: function() {
                $(this).html(" ");
            }
        };

        $.fn.fb_gallery = function (method) {

            this.paging = {};

            if (methods[method]) {
                return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
            } else if (typeof method === 'object' || !method) {
                return methods.init.apply(this, arguments);
            } else {
                $.error('Method ' + method + ' does not exist on jQuery.galeria');
           }
    };
}(jQuery));