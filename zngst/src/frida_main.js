Java.perform(function () {
    var webView = Java.use("android.webkit.WebView");
    webView.$init.overload('android.content.Context').implementation = function (a) {
        console.log("webView.$init is called!");
        var retval = this.$init(a);
        this.setWebContentsDebuggingEnabled(true);
        return retval;
    }
    webView.$init.overload('android.content.Context', 'android.util.AttributeSet').implementation = function (a, b) {
        console.log("webView.$init is called!");
        var retval = this.$init(a, b);
        this.setWebContentsDebuggingEnabled(true);
        return retval;
    }
    webView.$init.overload('android.content.Context', 'android.util.AttributeSet', 'int').implementation = function (a, b, c) {
        console.log("webView.$init is called!");
        var retval = this.$init(a, b, c);
        this.setWebContentsDebuggingEnabled(true);
        return retval;
    }
    webView.$init.overload('android.content.Context', 'android.util.AttributeSet', 'int', 'int').implementation = function (a, b, c, d) {
        console.log("webView.$init is called!");
        var retval = this.$init(a, b, c, d);
        this.setWebContentsDebuggingEnabled(true);
        return retval;
    }
    webView.$init.overload('android.content.Context', 'android.util.AttributeSet', 'int', 'boolean').implementation = function (a, b, c, d) {
        console.log("webView.$init is called!");
        var retval = this.$init(a, b, c, d);
        this.setWebContentsDebuggingEnabled(true);
        return retval;
    }
    webView.$init.overload('android.content.Context', 'android.util.AttributeSet', 'int', 'java.util.Map', 'boolean').implementation = function (a, b, c, d, e) {
        console.log("webView.$init is called!");
        var retval = this.$init(a, b, c, d, e);
        this.setWebContentsDebuggingEnabled(true);
        return retval;
    }
    webView.$init.overload('android.content.Context', 'android.util.AttributeSet', 'int', 'int', 'java.util.Map', 'boolean').implementation = function (a, b, c, d, e, f) {
        console.log("webView.$init is called!");
        var retval = this.$init(a, b, c, d, e, f);
        this.setWebContentsDebuggingEnabled(true);
        return retval;
    }
    webView.setWebContentsDebuggingEnabled.implementation = function(a) {
        this.setWebContentsDebuggingEnabled(true);
        console.log("setWebContentsDebuggingEnabled is called");
    }
})