/**
 * Javascript client library for OpenCPU
 * Version 0.1
 * Depends: jQuery
 * Requires HTML5 FormData for file uploads
 * http://github.com/jeroenooms/opencpu.js
 * 
 * Include this file in your apps (packages).
 * Edit r_path variable below if needed.
 */

(function ( $ ) {
  
  //new Session()
  function Session(loc, key){
    this.loc = loc;
    this.key = key;
    
    this.getKey = function(){
      return key;
    }
    
    this.getLoc = function(){
      return loc;
    }
  }
  
  //for POSTing raw code snippets
  //new Snippet("rnorm(100)")
  function Snippet(code){
    this.code = code;
    
    this.getCode = function(){
      return code;
    }
  }
  
  //for POSTing files
  // new Upload($('#file')[0].files)
  function Upload(file){
    this.file = this.file;
    this.getFile(){
      return file;
    }
  }
  
  //low level call
  function r_fun_ajax(fun, settings, handler){
    //validate input
    if(!fun) throw "r_fun_call called without fun";
    var settings = settings || {};
    var handler = handler || function(){};
    
    //set global settings
    settings.url = settings.url || (opencpu.r_path + "/" + fun);
    settings.type = settings.type || "POST";
    settings.data = settings.data || {};
    settings.dataType = settings.dataType || "text";
    
    //ajax call
    var jqxhr = $.ajax(settings).done(function(){
      var loc = jqxhr.getResponseHeader('Location');
      var key = jqxhr.getResponseHeader('X-ocpu-session');
      loc ? handler(loc, key) : console.log("Response was successful but had no location?");
    }).fail(function(){
      console.log("OpenCPU error HTTP " + jqxhr.status + "\n" + jqxhr.responseText)
    });
    
    //function chaining
    return jqxhr;
  }  

  //call a function using uson arguments
  function r_fun_call_json(fun, args, handler){
    return r_fun_ajax(fun, {
      data: JSON.stringify(args || {}),
      contentType : 'application/json',      
    }, handler);
  }   
  
  //call function using url encoding
  //needs to wrap arguments in quotes, etc
  function r_fun_call_urlencoded(fun, args, handler){
    return r_fun_ajax(fun, {
      data: $.param(args || {}),
      contentType : 'x-www-form-urlencoded',       
    }, handler);    
  }
  
  //call a function using multipart/form-data
  //use for file uploads. Requires HTML5
  function r_fun_call_multipart(fun, args, handler){
    var data = new FormData();
    jQuery.each(args, function(key, value) {
      //value = transform(value);
      //data.append(key, file);
    });    
  }  
  
  //call a function. Automatically determines type based on argument classes.
  function r_fun_call(fun, args, handler){

  }    
  
  //call a function and return JSON
  function r_fun_json(fun, args, handler){
    return r_fun_call(fun, args, function(loc){
      $.get(loc + "R/.val/json", function(data){
        handler && handler(data);
      }).fail(function(){
        console.log("Failed to get JSON response for " + loc);
      });
    });
  }
  
  //post form data (including files)
  $.fn.r_post_form = function(fun, handler) {
    
    var targetform = this; 
    var postdata = new FormData(targetform[0]);
    
    return r_fun_ajax(fun, {
      data: postdata,
      cache: false,
      contentType: false,
      processData: false   
    }, handler);
  }
  
  //plotting widget
  //to be called on an (empty) div.
  $.fn.r_fun_plot = function(fun, args) {
    var targetdiv = this;
    var myplot = initplot(targetdiv);
 
    //reset state
    myplot.setlocation();
    myplot.spinner.show();

    // call the function
    return r_fun_call(fun, args, function(newloc) {
      myplot.setlocation(newloc);
    }).always(function(){
      myplot.spinner.hide();      
    });
  }
  
  function initplot(targetdiv){
    if(targetdiv.data("ocpuplot")){
      return targetdiv.data("ocpuplot");
    }
    var ocpuplot = function(){
      //local variables
      var Location
      var pngwidth;
      var pngheight;
      
      var plotdiv = $('<div />').attr({
        style: "width: 100%; height:100%; min-width: 100px; min-height: 100px; position:absolute; background-repeat:no-repeat; background-size: 100% 100%;"
      }).appendTo(targetdiv).css("background-image", "none");
      
      var spinner = $('<span />').attr({
        style : "position: absolute; top: 20px; left: 20px; z-index:1000; font-family: monospace;" 
      }).text("loading...").appendTo(plotdiv);
  
      var pdf = $('<a />').attr({
        target: "_blank",        
        style: "position: absolute; top: 10px; right: 10px; z-index:1000; text-decoration:underline; font-family: monospace;"
      }).text("pdf").appendTo(plotdiv);
  
      var svg = $('<a />').attr({
        target: "_blank",
        style: "position: absolute; top: 30px; right: 10px; z-index:1000; text-decoration:underline; font-family: monospace;"
      }).text("svg").appendTo(plotdiv);
  
      var png = $('<a />').attr({
        target: "_blank",
        style: "position: absolute; top: 50px; right: 10px; z-index:1000; text-decoration:underline; font-family: monospace;"
      }).text("png").appendTo(plotdiv);  
      
      function updatepng(){
        if(!Location) return;
        pngwidth = plotdiv.width();
        pngheight = plotdiv.height();
        plotdiv.css("background-image", "url(" + Location + "graphics/last/png?width=" + pngwidth + "&height=" + pngheight + ")");       
      }
      
      function setlocation(newloc){
        Location = newloc;
        if(!Location){
          pdf.hide();
          svg.hide();
          png.hide();
          plotdiv.css("background-image", "");
        } else {
          pdf.attr("href", Location + "graphics/last/pdf?width=11.69&height=8.27&paper=a4r").show();
          svg.attr("href", Location + "graphics/last/svg?width=11.69&height=8.27").show();
          png.attr("href", Location + "graphics/last/png?width=800&height=600").show(); 
          updatepng();
        }
      }

      // function to update the png image
      var onresize = debounce(function(e) {
        if(pngwidth == plotdiv.width() && pngheight == plotdiv.height()){
          return;
        }
        if(plotdiv.is(":visible")){
          updatepng();
        }        
      }, 500);   
      
      // register update handlers
      plotdiv.on("resize", onresize);
      $(window).on("resize", onresize);  
      
      //return objects      
      return {
        setlocation: setlocation,
        spinner : spinner
      }
    }();
    
    targetdiv.data("ocpuplot", ocpuplot);
    return ocpuplot;
  }

  // from understore.js
  function debounce(func, wait, immediate) {
    var result;
    var timeout = null;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate)
          result = func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow)
        result = func.apply(context, args);
      return result;
    }
  }
  
  //export
  window.opencpu = window.opencpu || {};
  var opencpu = window.opencpu;
  
  //global settings
  opencpu.r_path = "../R";

  //exported functions
  opencpu.r_fun_call = r_fun_call;
  opencpu.r_fun_post = r_fun_post;
  opencpu.r_fun_json = r_fun_json;
  
  //for innernetz exploder
  if (typeof console == "undefined") {
    this.console = {log: function() {}};
  }  
      
}( jQuery ));
