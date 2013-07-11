(function ($) {
    "use strict";
    $.support.cors = true;
    var log = ((c_log) ? c_log : alert);
    var paging = {}, data= [],
        private_methods = {

            get_fb : function(container, albumId, callB, p_url) {
            
                p_url = ((p_url === undefined) ? 'https:' + '//graph.facebook.com/' + albumId + '/photos?limit=1' : p_url);
                $.ajax({
                    url: p_url,
                    cache:false,
                    dataType: 'Json',
                    success: function (result) {
                        if ((result && result.data) && result.data.length > 0) { 
                            var data = private_methods.parse_fb(result);
                            private_methods[callB](container, data);
                            container.show();
                        } else {
                            private_methods.error_handler("Sorry, no results found!!!");
                        }
                    },
                    beforeSend: function () {
                        private_methods.cooltransition(container);
                    },
                    error: function(error) {
                       var err = ((error.responseJSON && error.responseJSON.error) ? error.responseJSON.error.message : "");
                       private_methods.error_handler(container, err);
                    }
                }); 
            },

            error_handler : function(container, message){
                $(".err", container).html("Error while loading new image");
                log(message);
                container.show();
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

            cooltransition: function(container){
                 container.hide();
            },
            
            construct: function (target, data) {
                var container = $(target), big_pic = $("<div class='bigPic'>"),
                    img = data.imgs;

                paging = data.paging;
                big_pic.append("<div class='bp_right_arrow' idx='0'" + ((data.paging.next) ? "" : "style='display:none'" )  + " ><img src='../assets/arrow.png' /></div>");
                big_pic.append("<div class='bp_left_arrow' style='display:none' idx='0'><img src='../assets/arrow.png'  /></div>");
                big_pic.append("<div class='bp_title'><div class='bp_name'>" + img.name + "</div><div class='fb_like'><div class='bt_like' ph_id='" + img.id +"'>Like</div><div class='num_likes'>" + img.likes.length + "</div></div></div>");
                big_pic.append($("<img class='bigPic_img' src='" + img.pic + "' style='max-width:" + container.width() + "px' />"));
                big_pic.append($(".err", container));
                container.html(big_pic);
                private_methods.bindButtons(container);
            },

            bp_arrows: function(container, call_side) {
                if (paging[call_side]) {
                    private_methods.get_fb(container, '', "addIconsAndBigPic", paging[call_side]);
                }
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

            bindButtons: function(container) {
                $(".bp_right_arrow", container).click(function(event) {
                    event.preventDefault();
                    container.trigger('bp_next', container);
                });

                $(".bp_left_arrow", container).click(function(event) {
                    event.preventDefault();
                    container.trigger('bp_before', container);
                });

                $(".bt_like", container).click(function(event) {
                    event.preventDefault();
                    container.trigger('like', container);
                });
            },

            addIconsAndBigPic: function(container, data) {
                
                var img = data.imgs;
                paging = data.paging;

                $(".bigPic_img", container).attr("src", img.pic);
                $(".bp_name", container).html( ((img.name) ? img.name : "") );
                $(".bt_like", container).attr("ph_id", img.id);
                $(".num_likes", container).html( ((img.likes) ? img.likes.length : 0) );
                
                if (paging.next) {
                    $(".bp_right_arrow", container).show();
                } else {
                    $(".bp_right_arrow", container).hide();
                }

                if (paging.before) {
                    $(".bp_left_arrow", container).show();
                } else {
                    $(".bp_left_arrow", container).hide();
                }
            }
        },

        methods = {
            init: function(options) {
                var settings = $.extend({
                    size: 1
                }, options);

                var $this = $(this);
                $this.append($("<div class='err'/></div>"));
                
                if(!(settings.albumId && settings.size) || (typeof settings.size !== 'number' && settings.size % 1 != 0) )  {
                    $(".err", $this).html("Options error");
                }

                return this.each(function(){

                    $this.bind({
                        'bp_next':   function() { private_methods.bp_arrows($(this), "next", 1); },
                        'bp_before': function() { private_methods.bp_arrows($(this), "before"); },
                        'like': function() { private_methods.fb_like.call($(this), settings.access_token); }
                    });

                    private_methods.get_fb($this, settings.albumId, "construct");
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