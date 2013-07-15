(function ($) {

    var paging = [],
    	data = [],
    	c_index = 0;
        private_methods = {

            //ajax call to retrive images
            get_fb: function(size, callB, p_url, target) {
                var $this = this,
            	    callback = ((typeof  private_methods[callB] === "function") ? private_methods[callB] : function(){ container.html("<p>Error bad callback!!!</p>"); });
             
                $.ajax({
                    url: p_url,
                    dataType: 'Json',
                    success: function (result) {
                	    private_methods.parse(result, $this.attr("id"));
                	    callback.call($this, size, target);
                    },
                    beforeSend: function () {
                    	// container.html("<p>Wait, facebook processing!!!</p>");
                    },
                    error: function() {
                	    $(".err", $this).html("Error while loading new image");
                    }
                });              
            },
            
            //first set of images request
            first_Request: function(size, albumId, target, callB){
            	var p_url = 'https:' + '//graph.facebook.com/' + albumId + '/photos?limit=' + size;
			    private_methods.get_fb.call(this, size, "construct", p_url, target);
            },
             
            //async request for the other images
            start_Interval: function(size, p_url){
        		private_methods.get_fb.call(this, size, "addIcons", p_url);
            },

            parse: function (json, c_id) {
            
                var img,
                    next = ((json.paging && json.paging.next) ? json.paging.next : undefined),
                    before = ((json.paging && json.paging.previous) ? json.paging.previous : undefined);

                $(json.data).each(function (idx, obj) {
                    img = {
                        "icon": obj.picture, 
                        "pic": obj.source,
                        "likes": ((obj.likes && obj.likes.data) ? obj.likes.data : undefined),
                        "name": ((obj.name || "undifined") ? obj.name : undefined)
                    };
                    data.push(img);
                });
            
                paging = {'before' : before, 'next': next};
            },
            
            //html constuct
            construct: function (size, b_pic_id) {
                var scroller = $("<div class='scroller'>");
                var img_container = $("<div class='img_container'>");
                var list = $("<ul class='img_list'>");

                img_container.append(list); 
                scroller.append(img_container);
                scroller.append("<div class='left_arrow_vert'" + ((paging.before) ? "" : "style='display:none'") + " >");
                scroller.append("<div class='right_arrow_vert'" + ((paging.next) ? "" : "style='display:none'") + " >");

                size = ((data.length < size) ? data.length : size);

                for(var idx = 0; idx < size; idx++){
                    
                    var div = $("<img class='prev_icon' idx='" + idx + "' src='" + data[idx].icon + "'>"); 

                    private_methods.bind_icons.call(this, div, data[idx]);   
                    list.append($("<li>").append(div));
                }; 

                this.append(scroller);
                private_methods.bindButtons.call(this, size);

                if (paging["next"]) {
                    private_methods.start_Interval.call(this, size, paging["next"]);
                }

                var big_pic = $("#" + b_pic_id),
                    img = data[0];
 
                big_pic.append("<div class='bp_title'><div class='bp_name'>" + img.name + "</div><div class='fb_like'>Login to like</div>");
                big_pic.append($("<img class='bigPic_img' src='" + img.pic + "' style='max-height:" + this.height() + "px' />"));
                big_pic.append($(".err", this));
            },

            fill_scroller: function(c_idx){

                var list = $(".img_list", this).empty();

                for(var idx = c_idx; idx < (c_idx + size); idx++) { 
                    if (data[idx]) {
                        
                        var div = $("<img class='prev_icon' idx='"+idx+"' src='" + data[idx].icon + "'>"); 
                        
                        private_methods.bind_icons.call(this, div, data[idx]);  
                        list.append($("<li>").append(div));
                    }
                }
            },
            
            right_click: function(c_idx){

                //c_index += size;
                private_methods.fill_scroller.call(this, c_idx);
                private_methods.show_hide_arrows(this, c_idx);
            },

            left_click: function(c_idx){

                //c_index += -(size);
                private_methods.fill_scroller.call(this, c_idx);
                private_methods.show_hide_arrows(this, c_idx);
            },

            open: function(target, data){
                $("#" + target +"> img").attr("src", data.pic);
                $(".bp_name","#" + target).html(((data.name) ? data.name : "")) ;
            },

            bind_icons: function(target, d){

                var container = this,
                    data = d;

                target.click(function(event){
                    event.preventDefault();
                    container.trigger('open', data);
                });
            },

            bindButtons: function(size) {

    			var container = this;

    			$(".left_arrow_vert", container).click(function(event) {
                    event.preventDefault();
                    container.trigger('before', size);
    			});

                $(".right_arrow_vert", container).click(function(event) {
                    event.preventDefault();
                    container.trigger('next', size);
                });
            },

            show_hide_arrows: function(container, size){
                if ((c_index + size) > data.length) { 
                    $(".right_arrow", container).hide();
                    $(".left_arrow_vert", container).show();
                } else if(c_index === 0) {
                    $(".left_arrow", container).hide();
                    $(".right_arrow", container).show();
                } else {
                    $(".right_arrow", container).show();
                    $(".left_arrow", container).show();
                }
            },

		    addIcons: function ( size){
  
                if (paging["next"]) { 
                    private_methods.start_Interval.call(this, size, "addIcons", p_url);
                }
		    },
        },

        methods = {
            init: function(options){

                var $this = $(this),
                    settings = $.extend({
                        albumId: "",
                        size : 4,
                        target: ""
                     }, options);
                
                //append error div
                $this.append($("<div class='err'/></div>"));
                
                //options validation
                if((settings.albumId === "" || settings.target === "" ) || 
                        (typeof settings.size !== 'number' && settings.size % 1 != 0) || 
                        !($("#" + settings.target) && $("#" + settings.target).length > 0))  {
                        
                        $(".err", $this).html("Options error");
                        return; 
                }


                return $this.each(function(){
                    var $this = $(this);

                    private_methods.first_Request.call($this, settings.size, settings.albumId, settings.target,"construct");
                    
                    //bind events
                    $this.bind({
                        'next':   function() { private_methods.right_click.call($this, arguments[1]); },
                        'before': function() { private_methods.left_click.call($this, arguments[1]); },
                        'open':   function() { private_methods.open.call($this, settings.target, arguments[1]); }
                    });
                });
    		},
            destroy: function() {
                $(this).html(" ");
            }
	};

        $.fn.fb_scroller = function (method) {
            if (methods[method]) {
                return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
            } else if (typeof method === 'object' || !method) {
                return methods.init.apply(this, arguments);
            } else {
                $.error('Method ' + method + ' does not exist on jQuery.fb_scroller');
            } 
    };

})(jQuery);