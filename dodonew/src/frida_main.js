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

        // var hashMap = Java.use("java.util.HashMap");
        // hashMap.put.implementation = function (a, b) {
        //     console.log("HashMap put param1: " + a + " param2: " + b);
        //     return this.put(a, b);
        // }

        function showStackTrace() {
            console.log(
                Java.use("android.util.Log").getStackTraceString(
                    Java.use("java.lang.Throwable").$new()
                )
            );
        }

        // var arrayList = Java.use("java.util.ArrayList");
        // arrayList.add.overload("java.lang.Object").implementation = function (a) {
        //     try{
        //         if (a === null || a === undefined)
        //         {

        //         }else 
        //         {
        //             if (a.equals("username=1111")) {
        //             showStackTrace()                    
        //         }
        //         }
        //     // console.log(a);
        //     }
        //     catch (e) {

        //     }
                        
        //     return this.add(a);
        // }

        // arrayList.add.overload("int", "java.lang.Object").implementation = function (a, b) {
        //     return this.add(a, b);
        // }

        // var collections = Java.use("java.util.Collections")
        // collections.sort.overload('java.util.List').implementation = function (a) {
            
        //     try{var result = Java.cast(a, Java.use("java.util.ArrayList"));
        //     console.log("collections.sort List", result.toString());
        //     }catch (e) {}
        //     return this.sort(a);
        // }

        // collections.sort.overload("java.util.List", "java.util.Comparator").implementation = function (a, b) {
        //     showStackTrace();
        //     var result = Java.cast(a, Java.use("java.util.ArrayList"));
        //     console.log('collections.sort List Comparator', result.toString());
        //     return this.sort(a, b);
        // }
        // var jSONObject = Java.use("org.json.JSONObject");
        // jSONObject.put.overload('java.lang.String', 'java.lang.Object').implementation = function (a, b) {
        //     console.log("jSONObject.put", a, b);
        //     return this.put(a, b);
        // }

        // var base64 = Java.use("android.util.Base64");
        // base64.encodeToString.overload('[B', 'int').implementation = function (a, b) {
        //     showStackTrace();
        //     console.log(JSON.stringify(a));
        //     var result = this.encodeToString(a, b);
        //     console.log(result);
        //     return result;frida
        // }

        var str = Java.use("java.lang.String")
        str.getBytes.overload().implementation = function () {
            var result = this.getBytes();
            var newStr = str.$new(result);
            console.log(newStr);
            return result;
        }

        // jSONObject.getString.implementation = function (a) {
        //     console.log("jSONObject.getString", a);
        //     return this.getString(a);
        // }
    }
)