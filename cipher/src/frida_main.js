Java.perform(function () {
    // #region 栈信息和编码算法
    function showStacks() {
        console.log(
            Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Throwable").$new())
        )
    }
    
    var ByteString = Java.use("com.android.okhttp.okio.ByteString");
    function toBase64(tag, data) {
        console.log(tag + " Base64: " + ByteString.of(data).base64());
    }

    function toHex(tag, data) {
        console.log(tag + " Hex: " + ByteString.of(data).hex());
    }

    function toUtf8(tag, data) {
        console.log(tag + " Utf8: " + ByteString.of(data).utf8());
    }
    // #endregion

    // #region MD/SHA解密
    var messageDigest = Java.use("java.security.MessageDigest");
    
    messageDigest.update.overload('byte').implementation = function (b) {
        console.log("MessageDigest.update('byte') is called");
        showStacks();
        return this.update(data);
    }

    messageDigest.update.overload('java.nio.ByteBuffer').implementation = function (b) {
        console.log("MessageDigest.update('ava.nio.ByterBuffer') is called");
        showStacks();
        return this.update(data);
    }
    
    messageDigest.update.overload('[B').implementation = function (data) {
        console.log("MessageDigest.update('[B') is called");
        showStacks();
        var algorithm = this.getAlgorithm();
        var tag = algorithm + "update data";
        toUtf8(tag, data);
        toHex(tag, data);
        toBase64(tag, data);
        console.log("==================================================");
        
        return this.update(data);
    }

    messageDigest.update.overload('[B', 'int', 'int').implementation = function (data, offset, len) {
        console.log("MessageDigest.update('[B', 'int', 'int') is called");
        showStacks();
        var algorithm = this.getAlgorithm();
        var tag = algorithm + "update data";
        toUtf8(tag, data);
        toHex(tag, data);
        toBase64(tag, data);
        console.log("==================================================", offset, len);
        
        return this.update(data, offset, len);
    }
    // #endregion

    // #region HMAC解密
    var mac = Java.use("javax.crypto.Mac");
    mac.init.overload('java.security.Key').implementation = function (key) {
        console.log("Mac.init('java.security.Key') is called");
        var algorithm = this.getAlgorithm();
        var tag = algorithm + " init key";
        var keyBytes = key.getEncoded();
        toUtf8(tag, keyBytes);
        toHex(tag, keyBytes);
        toBase64(tag, keyBytes);
        console.log("==================================================");
        return this.init(key);
    }
    mac.init.overload('java.security.Key', 'java.security.spec.AlgorithmParameterSpec').implementation = function (key) {
        console.log("Mac.init('java.security.Key', 'java.security.spec.AlgorithmParameterSpec') is called");
        return this.init(key, AlgorithmParameterSpec);
    }

    mac.update.overload('byte').implementation = function (b) {
        console.log("Mac.update('byte') is called");
        showStacks();
        return this.update(data);
    }

    mac.update.overload('java.nio.ByteBuffer').implementation = function (b) {
        console.log("Mac.update('ava.nio.ByterBuffer') is called");
        showStacks();
        return this.update(data);
    }
    
    mac.update.overload('[B').implementation = function (data) {
        console.log("Mac.update('[B') is called");
        showStacks();
        var algorithm = this.getAlgorithm();
        var tag = algorithm + "update data";
        toUtf8(tag, data);
        toHex(tag, data);
        toBase64(tag, data);
        console.log("==================================================");
        
        return this.update(data);
    }

    mac.update.overload('[B', 'int', 'int').implementation = function (data, offset, len) {
        console.log("Mac.update('[B', 'int', 'int') is called");
        showStacks();
        var algorithm = this.getAlgorithm();
        var tag = algorithm + "update data";
        toUtf8(tag, data);
        toHex(tag, data);
        toBase64(tag, data);
        console.log("==================================================", offset, len);
        
        return this.update(data, offset, len);
    }

    mac.doFinal.overload().implementation = function () {
        console.log("Mac.doFinal() is called");
        var result = this.doFinal();
        var algorithm = this.getAlgorithm();
        var tag = algorithm + " doFinal result";
        toUtf8(tag, result);
        toHex(tag, result);
        toBase64(tag, result);
        console.log("==================================================");
        return result;
    }

    mac.doFinal.overload('[B').implementation = function (a) {
        console.log("Mac.doFinal() is called");
        var result = this.doFinal(a);
        var algorithm = this.getAlgorithm();
        var tag = algorithm + " doFinal result";
        toUtf8(tag, result);
        toHex(tag, result);
        toBase64(tag, result);
        console.log("==================================================");
        return result;
    }

    mac.doFinal.overload('[B', 'int').implementation = function (a, b) {
        console.log("Mac.doFinal() is called");
        var result = this.doFinal(a, b);
        var algorithm = this.getAlgorithm();
        var tag = algorithm + " doFinal result";
        toUtf8(tag, result);
        toHex(tag, result);
        toBase64(tag, result);
        console.log("==================================================");
        return result;
    }
    // #endregion
})