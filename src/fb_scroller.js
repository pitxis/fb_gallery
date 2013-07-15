(function ($) {

    var paging = [],
    	data = [],
    	c_index = 0;
        private_methods = {

            //ajax call to retrive images
            get_fb: function(size, callB, p_url) {
                var $this = this,
            	    callback = ((typeof  private_methods[callB] === "function") ? private_methods[callB] : function(){ container.html("<p>Error bad callback!!!</p>"); });
             
                $.ajax({
                    url: p_url,
                    dataType: 'Json',
                    success: function (result) {
                	    private_methods.parse(result, $this.attr("id"));
                	    callback.call($this, size);
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
            first_Request: function(size, albumId, callB){
            	var p_url = 'https:' + '//graph.facebook.com/' + albumId + '/photos?limit=' + size;
			    private_methods.get_fb.call(this, size, "construct", p_url);
            },
             
            //async request for the other images
            start_Interval: function(size, p_url){
        		private_methods.get_fb.call(this, size, "addIcons", p_url);
            },
            
            //html constuct
            construct: function (size) {
                var scroller = $("<div class='scroller'>");
                var img_container = $("<div class='img_container'>");
                var list = $("<ul class='img_list'>");

                img_container.append(list); 
                scroller.append(img_container);
                scroller.append("<div class='left_arrow_vert'" + ((paging.before) ? "" : "style='display:none'") + " >");
                scroller.append("<div class='right_arrow_vert'" + ((paging.next) ? "" : "style='display:none'") + " >");

                size = ((data.length < size) ? data.length : size);

                for(var idx = 0; idx < size; idx++){
                    var d = $("<img class='prev_icon' idx='" + idx + "' src='" + data[idx].icon + "'>").on("click", 
                        function(idx){ 
                            $(".bPic").attr("src", data[$(this).attr("idx")].pic); 
                        });
                    list.append($("<li>").append(d));
                }; 

                this.append(scroller);
                private_methods.bindButtons.call(this);

                if (paging["next"]) {
                    private_methods.start_Interval.call(this, size, paging["next"]);
                }
            },

            parse: function (json, c_id) {
			
                var img,
                    next = ((json.paging && json.paging.next) ? json.paging.next : undefined),
                    before = ((json.paging && json.paging.previous) ? json.paging.previous : undefined);

                $(json.data).each(function (idx, obj) {
                    img = {
                        "icon": obj.picture, 
                        "pic": obj.source,
                    };
                    data.push(img);
                });
            
                paging = {'before' : before, 'next': next};
            },

            bindButtons: function() {

    			var container = this;

    			$(".left_arrow_vert", container).click(function(event) {
                    event.preventDefault();
                    container.trigger('before', container);
    			});

                $(".right_arrow_vert", container).click(function(event) {
                    event.preventDefault();
                    container.trigger('next', container);
                });
            },

		    right_click: function(container, call_side, size){

                c_index += size;
                private_methods.fill_scroller(container, size);
                private_methods.show_hide_arrows(container, size);
		    },

		    left_click: function(container, call_side, size){

				c_index += -(size);
                private_methods.fill_scroller(container, size);
                private_methods.show_hide_arrows(container, size);
		    },

		    fill_scroller:function(container, size){

		    	var list = $(".img_list", container).empty();

                for(var idx = c_index; idx < (c_index + size); idx++) { 
                    if (data[idx]) {
                        var d = $("<img class='prev_icon' idx='"+idx+"' src='" + data[idx].icon + "'>").on("click", 
                            function(idx){ 
                               $(".bPic").attr("src", data[$(this).attr("idx")].pic); 
                            });
                        list.append($("<li>").append(d));
                    }
                }
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

                    private_methods.first_Request.call($this, settings.size, settings.albumId, "construct");
                    
                    //bind events
                    $this.bind({
                        'next':   function() { private_methods.right_click($(this), "next", settings.size)},
                        'before': function() { private_methods.left_click($(this), "before", settings.size)}
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