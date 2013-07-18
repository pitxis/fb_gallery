(function ($) {

    var private_methods = {

        //ajax call to retrive images
        get_fb: function(settings, callB, p_url) {
            var $this = this,
        	    callback = ((typeof  private_methods[callB] === "function") ? private_methods[callB] : function(){ container.html("<p>Error bad callback!!!</p>"); });
         
            $.ajax({
                url: p_url,
                dataType: 'Json',
                success: function (result) {
            	    var data = private_methods.parse(result, $this.attr("id"));
            	    callback.call($this, settings, data);
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
        first_Request: function(settings, callB){
        	var p_url = 'https:' + '//graph.facebook.com/' + settings.albumId + '/photos?limit=' + settings.size;
		    private_methods.get_fb.call(this, settings, "construct", p_url);
        },
         
        parse: function (json, c_id) {
        
            var img, data = [],
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

            return {"data":data, "paging":paging};
        },
        
        //html constuct
        construct: function (settings, result) {
            var data = result["data"],
                paging = result["paging"];

            if(data.length > 0){ 
                var scroller = $("<div class='scroller_"+ settings.orientation +"'>");
                var img_container = $("<div class='img_container'>");
                var list = $("<ul class='img_list'>");

                img_container.append(list); 
                scroller.append(img_container);
                scroller.append("<div class='left_arrow_"+ settings.orientation +"'"+ ((paging.before) ? "" : "style='display:none'") + " >");
                scroller.append("<div class='right_arrow_"+ settings.orientation +"'"+ + ((paging.next) ? "" : "style='display:none'") + " >");

                settings.size = ((data.length < settings.size) ? data.length : settings.size);

                for(var idx = 0; idx < settings.size; idx++){
                    
                    var div = $("<img class='prev_icon' idx='" + idx + "' src='" + data[idx].icon + "'>"); 

                    private_methods.bind_icons.call(this, div, data[idx]);   
                    list.append($("<li>").append(div));
                }; 

                this.append(scroller);
                private_methods.bindButtons.call(this, settings, paging);

                var big_pic = $("#" + settings.target),
                    img = data[0];
 
                big_pic.append("<div class='bp_title'><div class='bp_name'>" + img.name + "</div><div class='fb_like'>Login to like</div>");
                big_pic.append($("<img class='bigPic_img' src='" + img.pic + "' style='" + ((settings.orientation === "hor") ? "max-width:" + this.width() : "max-height:" + this.height()) + "px' />"));
                big_pic.append($(".err", this));
            } else {
                $(".err", this).html("No data returned");
            }
        },

        addIcons: function (settings, data) {

            private_methods.fill_scroller.call(this, data);
            private_methods.bindButtons.call(this, settings, data.paging);
            private_methods.show_hide_arrows.call(this, data.paging, settings.orientation);
        },

        fill_scroller: function(result){

            var list = $(".img_list", this).empty(), 
                data = result.data,
                paging = result.paging;

            for(var idx = 0; idx < data.length; idx++) { 
                    
                var div = $("<img class='prev_icon' idx='"+idx+"' src='" + data[idx].icon + "'>"); 
                
                private_methods.bind_icons.call(this, div, data[idx]);  
                list.append($("<li>").append(div));
            }
        },
        
        right_click: function(p_url, settings){

            private_methods.get_fb.call(this, settings, "addIcons", p_url);
            //private_methods.fill_scroller.call(this, c_idx, size);
            //private_methods.show_hide_arrows(this, c_idx, size, orientation);
        },

        left_click: function(n_url, settings){
            
            private_methods.get_fb.call(this, settings, "addIcons", n_url);
            //c_idx = c_idx - (size);
            //private_methods.fill_scroller.call(this, c_idx, size);
            //private_methods.show_hide_arrows(this, c_idx, size, orientation);
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

        bindButtons: function(settings, paging) {

			var container = this;

			$(".left_arrow_"+settings.orientation, container).click(function(event) {
                event.preventDefault();
                container.trigger('before', paging["before"]);
			});

            $(".right_arrow_"+settings.orientation, container).click(function(event) {
                event.preventDefault();
                container.trigger('next', paging["next"]);
            });
        },

        show_hide_arrows: function(paging, orientation){
            
            var right_b = $(".right_arrow_" + orientation, this).hide(),
                left_b = $(".left_arrow_" + orientation, this).hide();

            if(paging["next"]){
                right_b.show();
            }

            if(paging["before"]){
                left_b.show();
            }
        },

	   
    },

    methods = {
        init: function(options){

            var $this = $(this),
                settings = $.extend({
                    albumId: "",
                    size : 4,
                    target: "",
                    orientation: "hor"
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

                private_methods.first_Request.call($this, settings, "construct");
                
                //bind events
                $this.bind({
                    'next':   function() { private_methods.right_click.call($this, arguments[1], settings); },
                    'before': function() { private_methods.left_click.call($this, arguments[1], settings); },
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