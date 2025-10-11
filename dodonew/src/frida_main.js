Java.perform(
    function () {
        // var jsonRequest = Java.use("com.dodonew.online.http.JsonRequest");
        // console.log("JsonRequest class found: " + jsonRequest);
        // jsonRequest.paraMap.implementation = function (a) {
        //     console.log("JsonRequest param1" + a);
        //     this.paraMap(a);
        // }

        // jsonRequest.addRequestMap.overload('java.util.Map', 'int').implementation = function (a, b) {
        //     console.log("addRequestMap param1: " + a.get("username") + " " + a.get("userPwd"));
        //     // var c = Java.cast(a, Java.use("java.util.HashMap"));
        //     // console.log("c: ", c.toString());
        //     console.log("addRequestMap param2: " + b);
        //     this.addRequestMap(a, b);
        // }

        // var utils = Java.use("com.dodonew.online.util.Utils");
        // utils.md5.implementation = function (a) {
        //     console.log("md5: " + a);
        //     var retval = this.md5(a);
        //     console.log("md5 return: " + retval);
        //     return retval;
        // }

        // var requestutil = Java.use("com.dodonew.online.http.RequestUtil");
        // requestutil.encodeDesMap.overload('java.lang.String', 'java.lang.String', 'java.lang.String').implementation = function (a, b, c) {
        //     console.log("encodeDesMap param1: " + a);
        //     console.log("encodeDesMap param2: " + b);
        //     console.log("encodeDesMap param3: " + c);
        //     var retval = this.encodeDesMap(a, b, c);
        //     console.log("encodeDesMap return: " + retval);
        //     return retval;            
        // }

        // var base64 = Java.use("android.util.Base64");

        // var deskeyspec = Java.use("javax.crypto.spec.DESKeySpec");
        // deskeyspec.$init.overload('[B').implementation = function (a) {
        //     console.log("DESKeySpec param1: " + base64.encodeToString(a, 0));
        //     this.$init(a);
        // }

        var hashMap = Java.use("java.util.HashMap");
        hashMap.put.implementation = function (a, b) {
            console.log("HashMap put param1: " + a + " param2: " + b);
            return this.put(a, b);
        }
    }
)