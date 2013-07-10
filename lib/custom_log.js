//I copied this function from the book Secrets of the JavaScript Ninja by John Resig, Bear Bibeault//

var c_log = function()  {
    try {
        console.log.apply(console, arguments); 
    }
    catch(e) { 
        try {
            opera.postError.apply(opera, arguments); 
        }
        catch(e){
            alert(Array.prototype.join.call( arguments, " ")); 
        }
    }
}