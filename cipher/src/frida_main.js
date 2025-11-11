Java.perform(function () {
    // ============================================================
    // 配置选项 - 控制日志输出行为
    // ============================================================
    var CONFIG = {
        showTimestamp: true,       // 是否显示时间戳
        showStackTrace: true,      // 是否显示调用栈
        showAlgorithm: true,       // 是否显示算法名称
        maxStackLines: 10,         // 堆栈显示最大行数
        
        // 堆栈过滤：需要过滤掉的系统包（不显示这些包的堆栈）
        systemPackages: [
            'java.lang.reflect.',
            'android.os.Handler',
            'android.os.Looper',
            'android.app.ActivityThread',
            'com.android.internal.',
            'dalvik.system.',
            'java.lang.Thread.run',
            'android.app.Instrumentation',
            'com.android.server.',
        ]
    };
    
    // ============================================================
    // 工具函数区域
    // ============================================================
    
    /**
     * 获取当前时间戳字符串
     */
    function getTimestamp() {
        if (!CONFIG.showTimestamp) {
            return "";
        }
        var date = new Date();
        return "[" + date.toISOString() + "] ";
    }
    
    /**
     * 打印栈跟踪信息（优化版：过滤并格式化）
     */
    function showStacks() {
        if (!CONFIG.showStackTrace) {
            return;
        }
        try {
            var stackTrace = Java.use("android.util.Log")
                .getStackTraceString(Java.use("java.lang.Throwable").$new());
            
            // 分割成行
            var lines = stackTrace.split('\n');
            var filteredLines = [];
            var appLines = [];
            
            // 处理每一行
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i].trim();
                if (!line || line === 'java.lang.Throwable') {
                    continue;
                }
                
                // 检查是否是需要过滤的系统包
                var isSystemPackage = false;
                for (var j = 0; j < CONFIG.systemPackages.length; j++) {
                    if (line.indexOf(CONFIG.systemPackages[j]) !== -1) {
                        isSystemPackage = true;
                        break;
                    }
                }
                
                // 检查是否是应用代码（不以 android. 或 java. 开头）
                var isAppCode = line.indexOf('at ') === 0 && 
                               line.indexOf('at android.') === -1 && 
                               line.indexOf('at java.') === -1 &&
                               line.indexOf('at javax.') === -1 &&
                               line.indexOf('at com.android.') === -1 &&
                               line.indexOf('at dalvik.') === -1;
                
                if (!isSystemPackage) {
                    if (isAppCode) {
                        appLines.push(line);
                    }
                    filteredLines.push(line);
                }
            }
            
            console.log("📍 调用栈:");
            
            // 如果有应用代码，优先显示
            if (appLines.length > 0) {
                console.log("🎯 关键调用 (应用代码):");
                for (var k = 0; k < appLines.length; k++) {
                    console.log("   " + appLines[k].replace('at ', '➜ '));
                }
                console.log("");
            }
            
            // 显示完整的过滤后堆栈（限制行数）
            if (filteredLines.length > 0) {
                console.log("📚 完整调用链:");
                for (var m = 0; m < Math.min(filteredLines.length, CONFIG.maxStackLines); m++) {
                    // 高亮显示应用代码
                    var line = filteredLines[m];
                    var isApp = line.indexOf('at android.') === -1 && 
                               line.indexOf('at java.') === -1 &&
                               line.indexOf('at javax.') === -1;
                    
                    if (isApp) {
                        console.log("   🔸 " + line.replace('at ', ''));
                    } else {
                        console.log("   │  " + line.replace('at ', ''));
                    }
                }
                
                if (filteredLines.length > CONFIG.maxStackLines) {
                    console.log("   ... (" + (filteredLines.length - CONFIG.maxStackLines) + " 行已省略)");
                }
            }
        } catch (e) {
            console.log("⚠️ 获取栈信息失败: " + e);
        }
    }
    
    /**
     * 安全地切片 Java 字节数组
     */
    function sliceByteArray(data, offset, length) {
        if (!data || data.length === 0) {
            return [];
        }
        
        try {
            // 尝试使用 Java Arrays.copyOfRange
            var Arrays = Java.use("java.util.Arrays");
            return Arrays.copyOfRange(data, offset, offset + length);
        } catch (e) {
            // 降级方案：手动复制
            try {
                var result = [];
                for (var i = 0; i < length && (offset + i) < data.length; i++) {
                    result.push(data[offset + i]);
                }
                return result;
            } catch (e2) {
                console.log("⚠️ 字节数组切片失败: " + e2);
                return data;
            }
        }
    }
    
    /**
     * 智能提取公钥信息（支持多种密钥实现）
     */
    function extractPublicKeyInfo(publicKey, algorithm) {
        var keyInfo = {
            encoded: null,
            format: null,
            algorithm: null,
            details: {}
        };
        
        try {
            // 获取密钥类名和基本信息
            var keyClassName = publicKey.$className;
            console.log("🔑 密钥类型: " + keyClassName);
            
            // 安全获取算法名称
            try {
                keyInfo.algorithm = publicKey.getAlgorithm();
                console.log("🔑 密钥算法: " + keyInfo.algorithm);
            } catch (e) {
                console.log("⚠️ 无法获取密钥算法: " + e);
            }
            
            // 根据类名直接进行向下转型并获取密钥信息
            var castedKey = null;
            var keyType = null;
            
            // 检测并转型：OpenSSL RSA 公钥
            if (keyClassName.indexOf("OpenSSLRSAPublicKey") !== -1) {
                try {
                    var OpenSSLRSAPublicKey = Java.use("com.android.org.conscrypt.OpenSSLRSAPublicKey");
                    castedKey = Java.cast(publicKey, OpenSSLRSAPublicKey);
                    keyType = "OpenSSL RSA";
                    
                    // 安全获取编码和格式
                    try {
                        keyInfo.encoded = castedKey.getEncoded();
                    } catch (e) {
                        console.log("⚠️ getEncoded() 失败: " + e);
                    }
                    
                    try {
                        keyInfo.format = castedKey.getFormat();
                    } catch (e) {
                        console.log("⚠️ getFormat() 失败: " + e);
                    }
                    
                    // 安全获取 RSA 参数
                    try {
                        var modulus = castedKey.getModulus();
                        var exponent = castedKey.getPublicExponent();
                        keyInfo.details.modulus = modulus.toString(16);
                        keyInfo.details.exponent = exponent.toString();
                        console.log("📐 RSA 模数长度: " + modulus.bitLength() + " bits");
                        console.log("📐 RSA 指数: " + exponent.toString());
                    } catch (e) {
                        console.log("⚠️ 获取 RSA 参数失败: " + e);
                    }
                    
                    if (keyInfo.encoded) {
                        logData(algorithm + " - 公钥 (OpenSSL RSA)", keyInfo.encoded);
                    }
                    return keyInfo;
                } catch (e) {
                    console.log("⚠️ OpenSSL RSA 转型失败: " + e);
                }
            }
            
            // 检测并转型：OpenSSL EC 公钥
            if (keyClassName.indexOf("OpenSSLECPublicKey") !== -1) {
                try {
                    var OpenSSLECPublicKey = Java.use("com.android.org.conscrypt.OpenSSLECPublicKey");
                    castedKey = Java.cast(publicKey, OpenSSLECPublicKey);
                    keyType = "OpenSSL EC";
                    
                    // 安全获取编码和格式
                    try {
                        keyInfo.encoded = castedKey.getEncoded();
                    } catch (e) {
                        console.log("⚠️ getEncoded() 失败: " + e);
                    }
                    
                    try {
                        keyInfo.format = castedKey.getFormat();
                    } catch (e) {
                        console.log("⚠️ getFormat() 失败: " + e);
                    }
                    
                    // 安全获取 EC 参数
                    try {
                        var params = castedKey.getParams();
                        keyInfo.details.curve = params.getCurve().toString();
                        console.log("📐 EC 曲线: " + params.getCurve().toString());
                    } catch (e) {
                        console.log("⚠️ 获取 EC 参数失败: " + e);
                    }
                    
                    if (keyInfo.encoded) {
                        logData(algorithm + " - 公钥 (OpenSSL EC)", keyInfo.encoded);
                    }
                    return keyInfo;
                } catch (e) {
                    console.log("⚠️ OpenSSL EC 转型失败: " + e);
                }
            }
            
            // 尝试标准接口：RSAPublicKey
            try {
                var RSAPublicKey = Java.use("java.security.interfaces.RSAPublicKey");
                castedKey = Java.cast(publicKey, RSAPublicKey);
                keyType = "标准 RSA";
                
                // 安全获取 RSA 参数
                try {
                    var modulus = castedKey.getModulus();
                    var exponent = castedKey.getPublicExponent();
                    keyInfo.details.modulus = modulus.toString(16);
                    keyInfo.details.exponent = exponent.toString();
                    console.log("📐 RSA 模数长度: " + modulus.bitLength() + " bits");
                    console.log("📐 RSA 指数: " + exponent.toString());
                } catch (e) {
                    console.log("⚠️ 获取 RSA 参数失败: " + e);
                }
                
                // 使用转型后的对象获取编码
                try {
                    keyInfo.encoded = castedKey.getEncoded();
                    keyInfo.format = castedKey.getFormat();
                } catch (e) {
                    // 某些实现可能不支持 getEncoded
                    try {
                        keyInfo.encoded = publicKey.getEncoded();
                        keyInfo.format = publicKey.getFormat();
                    } catch (e2) {
                        console.log("⚠️ getEncoded() 失败: " + e2);
                    }
                }
                
                if (keyInfo.encoded) {
                    logData(algorithm + " - 公钥 (标准 RSA)", keyInfo.encoded);
                }
                return keyInfo;
            } catch (e) {
                // 不是 RSA 公钥，继续尝试其他类型
            }
            
            // 尝试标准接口：ECPublicKey
            try {
                var ECPublicKey = Java.use("java.security.interfaces.ECPublicKey");
                castedKey = Java.cast(publicKey, ECPublicKey);
                keyType = "标准 EC";
                
                // 安全获取 EC 参数
                try {
                    var w = castedKey.getW();
                    keyInfo.details.x = w.getAffineX().toString(16);
                    keyInfo.details.y = w.getAffineY().toString(16);
                    console.log("📐 EC 点 X: " + keyInfo.details.x.substring(0, 32) + "...");
                    console.log("📐 EC 点 Y: " + keyInfo.details.y.substring(0, 32) + "...");
                } catch (e) {
                    console.log("⚠️ 获取 EC 参数失败: " + e);
                }
                
                // 使用转型后的对象获取编码
                try {
                    keyInfo.encoded = castedKey.getEncoded();
                    keyInfo.format = castedKey.getFormat();
                } catch (e) {
                    try {
                        keyInfo.encoded = publicKey.getEncoded();
                        keyInfo.format = publicKey.getFormat();
                    } catch (e2) {
                        console.log("⚠️ getEncoded() 失败: " + e2);
                    }
                }
                
                if (keyInfo.encoded) {
                    logData(algorithm + " - 公钥 (标准 EC)", keyInfo.encoded);
                }
                return keyInfo;
            } catch (e) {
                // 不是 EC 公钥
            }
            
            // 降级方案：尝试标准方法
            try {
                keyInfo.encoded = publicKey.getEncoded();
                keyInfo.format = publicKey.getFormat();
                if (keyInfo.encoded) {
                    logData(algorithm + " - 公钥 (标准)", keyInfo.encoded);
                    return keyInfo;
                }
            } catch (e) {
                console.log("⚠️ 标准 getEncoded() 失败: " + e);
            }
            
            console.log("⚠️ 无法提取公钥编码，但已获取部分信息");
            
        } catch (e) {
            console.log("⚠️ 提取公钥信息失败: " + e);
        }
        
        return keyInfo;
    }
    
    /**
     * 智能提取私钥信息（支持多种密钥实现）
     */
    function extractPrivateKeyInfo(privateKey, algorithm) {
        var keyInfo = {
            encoded: null,
            format: null,
            algorithm: null,
            details: {}
        };
        
        try {
            // 获取密钥类名和基本信息
            var keyClassName = privateKey.$className;
            console.log("🔑 密钥类型: " + keyClassName);
            
            // 安全获取算法名称
            try {
                keyInfo.algorithm = privateKey.getAlgorithm();
                console.log("🔑 密钥算法: " + keyInfo.algorithm);
            } catch (e) {
                console.log("⚠️ 无法获取密钥算法: " + e);
            }
            
            // 根据类名直接进行向下转型并获取密钥信息
            var castedKey = null;
            var keyType = null;
            
            // 检测并转型：OpenSSL RSA 私钥
            if (keyClassName.indexOf("OpenSSLRSAPrivateKey") !== -1) {
                try {
                    var OpenSSLRSAPrivateKey = Java.use("com.android.org.conscrypt.OpenSSLRSAPrivateKey");
                    castedKey = Java.cast(privateKey, OpenSSLRSAPrivateKey);
                    keyType = "OpenSSL RSA";
                    
                    // 安全获取编码和格式
                    try {
                        keyInfo.encoded = castedKey.getEncoded();
                    } catch (e) {
                        console.log("⚠️ getEncoded() 失败: " + e);
                    }
                    
                    try {
                        keyInfo.format = castedKey.getFormat();
                    } catch (e) {
                        console.log("⚠️ getFormat() 失败: " + e);
                    }
                    
                    // 安全获取 RSA 参数
                    try {
                        var modulus = castedKey.getModulus();
                        keyInfo.details.modulus = modulus.toString(16);
                        console.log("📐 RSA 模数长度: " + modulus.bitLength() + " bits");
                    } catch (e) {
                        console.log("⚠️ 获取 RSA 参数失败: " + e);
                    }
                    
                    if (keyInfo.encoded) {
                        logData(algorithm + " - 私钥 (OpenSSL RSA)", keyInfo.encoded);
                    }
                    return keyInfo;
                } catch (e) {
                    console.log("⚠️ OpenSSL RSA 转型失败: " + e);
                }
            }
            
            // 检测并转型：OpenSSL EC 私钥
            if (keyClassName.indexOf("OpenSSLECPrivateKey") !== -1) {
                try {
                    var OpenSSLECPrivateKey = Java.use("com.android.org.conscrypt.OpenSSLECPrivateKey");
                    castedKey = Java.cast(privateKey, OpenSSLECPrivateKey);
                    keyType = "OpenSSL EC";
                    
                    // 安全获取编码和格式
                    try {
                        keyInfo.encoded = castedKey.getEncoded();
                    } catch (e) {
                        console.log("⚠️ getEncoded() 失败: " + e);
                    }
                    
                    try {
                        keyInfo.format = castedKey.getFormat();
                    } catch (e) {
                        console.log("⚠️ getFormat() 失败: " + e);
                    }
                    
                    if (keyInfo.encoded) {
                        logData(algorithm + " - 私钥 (OpenSSL EC)", keyInfo.encoded);
                    }
                    return keyInfo;
                } catch (e) {
                    console.log("⚠️ OpenSSL EC 转型失败: " + e);
                }
            }
            
            // 尝试标准接口：RSAPrivateKey
            try {
                var RSAPrivateKey = Java.use("java.security.interfaces.RSAPrivateKey");
                castedKey = Java.cast(privateKey, RSAPrivateKey);
                keyType = "标准 RSA";
                
                // 安全获取 RSA 参数
                try {
                    var modulus = castedKey.getModulus();
                    keyInfo.details.modulus = modulus.toString(16);
                    console.log("📐 RSA 模数长度: " + modulus.bitLength() + " bits");
                } catch (e) {
                    console.log("⚠️ 获取 RSA 参数失败: " + e);
                }
                
                // 使用转型后的对象获取编码
                try {
                    keyInfo.encoded = castedKey.getEncoded();
                    keyInfo.format = castedKey.getFormat();
                } catch (e) {
                    // 某些实现可能不支持 getEncoded（如硬件密钥）
                    try {
                        keyInfo.encoded = privateKey.getEncoded();
                        keyInfo.format = privateKey.getFormat();
                    } catch (e2) {
                        console.log("⚠️ 无法获取私钥编码（可能是硬件密钥）");
                    }
                }
                
                if (keyInfo.encoded) {
                    logData(algorithm + " - 私钥 (标准 RSA)", keyInfo.encoded);
                }
                
                // 即使没有编码，也返回已获取的信息
                return keyInfo;
            } catch (e) {
                // 不是 RSA 私钥，继续尝试其他类型
            }
            
            // 尝试标准接口：ECPrivateKey
            try {
                var ECPrivateKey = Java.use("java.security.interfaces.ECPrivateKey");
                castedKey = Java.cast(privateKey, ECPrivateKey);
                keyType = "标准 EC";
                
                // 安全获取 EC 参数
                try {
                    var s = castedKey.getS();
                    keyInfo.details.s = s.toString(16);
                    console.log("📐 EC 私钥参数长度: " + keyInfo.details.s.length + " hex chars");
                } catch (e) {
                    console.log("⚠️ 获取 EC 参数失败: " + e);
                }
                
                // 使用转型后的对象获取编码
                try {
                    keyInfo.encoded = castedKey.getEncoded();
                    keyInfo.format = castedKey.getFormat();
                } catch (e) {
                    try {
                        keyInfo.encoded = privateKey.getEncoded();
                        keyInfo.format = privateKey.getFormat();
                    } catch (e2) {
                        console.log("⚠️ 无法获取私钥编码（可能是硬件密钥）");
                    }
                }
                
                if (keyInfo.encoded) {
                    logData(algorithm + " - 私钥 (标准 EC)", keyInfo.encoded);
                }
                
                // 即使没有编码，也返回已获取的信息
                return keyInfo;
            } catch (e) {
                // 不是 EC 私钥
            }
            
            // 降级方案：尝试标准方法
            try {
                keyInfo.encoded = privateKey.getEncoded();
                keyInfo.format = privateKey.getFormat();
                if (keyInfo.encoded) {
                    logData(algorithm + " - 私钥 (标准)", keyInfo.encoded);
                    return keyInfo;
                }
            } catch (e) {
                console.log("⚠️ 标准 getEncoded() 失败（可能是硬件密钥）: " + e);
            }
            
            console.log("⚠️ 无法提取私钥编码（可能存储在硬件中），但已获取部分信息");
            
        } catch (e) {
            console.log("⚠️ 提取私钥信息失败: " + e);
        }
        
        return keyInfo;
    }
    
    /**
     * 多格式输出数据（Hex, Base64, UTF-8）
     */
    var ByteString = Java.use("com.android.okhttp.okio.ByteString");
    
    function logData(tag, data) {
        if (!data) {
            console.log(tag + " [数据为空]");
            return;
        }
        
        try {
            var byteString = ByteString.of(data);
            console.log("┌─ " + tag);
            console.log("│ 📝 Hex:    " + byteString.hex());
            console.log("│ 🔤 Base64: " + byteString.base64());
            
            try {
                var utf8Str = byteString.utf8();
                // 只显示可打印字符
                if (utf8Str && utf8Str.length > 0) {
                    console.log("│ 📄 UTF-8:  " + utf8Str.replace(/[^\x20-\x7E]/g, '.'));
                }
            } catch (e) {
                console.log("│ 📄 UTF-8:  [无法解析]");
            }
            
            console.log("│ 📊 长度:   " + data.length + " bytes");
            console.log("└─");
        } catch (e) {
            console.log("⚠️ 数据输出失败: " + e);
        }
    }
    
    /**
     * 解码 Cipher 操作模式
     */
    function getCipherMode(mode) {
        var modes = {
            1: "ENCRYPT_MODE (加密)",
            2: "DECRYPT_MODE (解密)",
            3: "WRAP_MODE (密钥包装)",
            4: "UNWRAP_MODE (密钥解包)"
        };
        return modes[mode] || "UNKNOWN_MODE (" + mode + ")";
    }
    
    /**
     * 打印算法信息（根据配置决定是否显示）
     */
    function logAlgorithm(algorithm) {
        if (CONFIG.showAlgorithm) {
            console.log("📌 算法: " + algorithm);
        }
    }
    
    /**
     * 打印 Cipher 模式信息（根据配置决定是否显示）
     */
    function logCipherMode(mode) {
        if (CONFIG.showAlgorithm) {
            console.log("🔧 模式: " + getCipherMode(mode));
        }
    }
    
    /**
     * 打印分隔线
     */
    function printSeparator() {
        console.log("═".repeat(60));
    }
    
    /**
     * 提取并显示 IV 向量（用于 Cipher）
     */
    function extractAndLogIV(algorithm, params) {
        try {
            var IvParameterSpec = Java.use("javax.crypto.spec.IvParameterSpec");
            var iv = null;
            
            // 尝试从 AlgorithmParameters 提取
            if (params.getParameterSpec) {
                iv = params.getParameterSpec(IvParameterSpec.class).getIV();
            } 
            // 尝试从 AlgorithmParameterSpec 提取
            else if (params.getIV) {
                iv = params.getIV();
            }
            
            if (iv) {
                logData(algorithm + " - IV 向量", iv);
            }
        } catch (e) {
            // 不是所有算法都需要 IV，所以忽略错误
        }
    }
    
    /**
     * 统一处理 Cipher.init 的日志输出
     */
    function logCipherInitInfo(cipherInstance, methodName, opmode, keyOrCert, params) {
        var algorithm = cipherInstance.getAlgorithm();
        console.log(getTimestamp() + "🔒 Cipher.init(" + methodName + ") 被调用");
        logAlgorithm(algorithm);
        logCipherMode(opmode);
        
        // 处理密钥或证书
        try {
            // 检查是否是证书
            if (keyOrCert.getPublicKey) {
                var publicKey = keyOrCert.getPublicKey();
                console.log("📜 使用证书初始化");
                console.log("   证书类型: " + keyOrCert.getType());
                extractPublicKeyInfo(publicKey, algorithm);
            }
            // 处理密钥（公钥或私钥）
            else if (keyOrCert.getAlgorithm) {
                var keyAlgorithm = keyOrCert.getAlgorithm();
                console.log("🔑 密钥算法: " + keyAlgorithm);
                
                // 尝试判断是公钥还是私钥
                try {
                    // 检查是否实现了 PrivateKey 接口
                    var PrivateKey = Java.use("java.security.PrivateKey");
                    Java.cast(keyOrCert, PrivateKey);
                    extractPrivateKeyInfo(keyOrCert, algorithm);
                } catch (e) {
                    // 不是私钥，尝试公钥
                    try {
                        var PublicKey = Java.use("java.security.PublicKey");
                        Java.cast(keyOrCert, PublicKey);
                        extractPublicKeyInfo(keyOrCert, algorithm);
                    } catch (e2) {
                        // 可能是对称密钥
                        try {
                            var keyBytes = keyOrCert.getEncoded();
                            logData(algorithm + " - 密钥", keyBytes);
                        } catch (e3) {
                            console.log("⚠️ 无法获取密钥编码: " + e3);
                        }
                    }
                }
            }
        } catch (e) {
            console.log("⚠️ 处理密钥信息失败: " + e);
        }
        
        // 处理 IV（如果存在）
        if (params) {
            extractAndLogIV(algorithm, params);
        }
        
        showStacks();
        printSeparator();
    }
    // #endregion

    // ============================================================
    // MessageDigest Hook (MD5/SHA1/SHA256/SHA512 等)
    // ============================================================
    var messageDigest = Java.use("java.security.MessageDigest");
    
    messageDigest.update.overload('byte').implementation = function (b) {
        console.log(getTimestamp() + "🔐 MessageDigest.update(byte) 被调用");
        logAlgorithm(this.getAlgorithm());
        showStacks();
        printSeparator();
        return this.update(b);
    }

    messageDigest.update.overload('java.nio.ByteBuffer').implementation = function (buffer) {
        console.log(getTimestamp() + "🔐 MessageDigest.update(ByteBuffer) 被调用");
        logAlgorithm(this.getAlgorithm());
        showStacks();
        printSeparator();
        return this.update(buffer);
    }
    
    messageDigest.update.overload('[B').implementation = function (data) {
        var algorithm = this.getAlgorithm();
        console.log(getTimestamp() + "🔐 MessageDigest.update(byte[]) 被调用");
        logAlgorithm(algorithm);
        
        logData(algorithm + " - 更新数据", data);
        showStacks();
        printSeparator();
        
        return this.update(data);
    }

    messageDigest.update.overload('[B', 'int', 'int').implementation = function (data, offset, len) {
        var algorithm = this.getAlgorithm();
        console.log(getTimestamp() + "🔐 MessageDigest.update(byte[], int, int) 被调用");
        logAlgorithm(algorithm);
        console.log("📍 偏移量: " + offset + ", 长度: " + len);
        
        // 只输出指定范围的数据
        var slicedData = sliceByteArray(data, offset, len);
        logData(algorithm + " - 更新数据 (切片)", slicedData);
        showStacks();
        printSeparator();
        
        return this.update(data, offset, len);
    }
    
    messageDigest.digest.overload().implementation = function () {
        var algorithm = this.getAlgorithm();
        console.log(getTimestamp() + "🔐 MessageDigest.digest() 被调用");
        logAlgorithm(algorithm);
        
        var result = this.digest();
        logData(algorithm + " - 哈希结果", result);
        printSeparator();
        
        return result;
    }
    
    messageDigest.digest.overload('[B').implementation = function (input) {
        var algorithm = this.getAlgorithm();
        console.log(getTimestamp() + "🔐 MessageDigest.digest(byte[]) 被调用");
        logAlgorithm(algorithm);
        
        logData(algorithm + " - 输入数据", input);
        var result = this.digest(input);
        logData(algorithm + " - 哈希结果", result);
        printSeparator();
        
        return result;
    }
    // #endregion

    // ============================================================
    // Mac Hook (HMAC-MD5/HMAC-SHA1/HMAC-SHA256 等)
    // ============================================================
    var mac = Java.use("javax.crypto.Mac");
    
    mac.init.overload('java.security.Key').implementation = function (key) {
        var algorithm = this.getAlgorithm();
        console.log(getTimestamp() + "🔑 Mac.init(Key) 被调用");
        logAlgorithm(algorithm);
        
        try {
            console.log("🔑 密钥类型: " + key.$className);
            console.log("🔑 密钥算法: " + key.getAlgorithm());
            console.log("🔑 密钥格式: " + key.getFormat());
            
            var keyBytes = key.getEncoded();
            logData(algorithm + " - 初始化密钥", keyBytes);
        } catch (e) {
            console.log("⚠️ 无法获取密钥信息: " + e);
        }
        
        showStacks();
        printSeparator();
        
        return this.init(key);
    }
    
    mac.init.overload('java.security.Key', 'java.security.spec.AlgorithmParameterSpec').implementation = function (key, spec) {
        var algorithm = this.getAlgorithm();
        console.log(getTimestamp() + "🔑 Mac.init(Key, AlgorithmParameterSpec) 被调用");
        logAlgorithm(algorithm);
        
        try {
            console.log("🔑 密钥类型: " + key.$className);
            console.log("🔑 密钥算法: " + key.getAlgorithm());
            console.log("🔑 密钥格式: " + key.getFormat());
            console.log("🔑 参数规格: " + spec.$className);
            
            var keyBytes = key.getEncoded();
            logData(algorithm + " - 初始化密钥", keyBytes);
        } catch (e) {
            console.log("⚠️ 无法获取密钥信息: " + e);
        }
        
        showStacks();
        printSeparator();
        
        return this.init(key, spec);
    }

    mac.update.overload('byte').implementation = function (b) {
        console.log(getTimestamp() + "🔑 Mac.update(byte) 被调用");
        logAlgorithm(this.getAlgorithm());
        showStacks();
        printSeparator();
        return this.update(b);
    }

    mac.update.overload('java.nio.ByteBuffer').implementation = function (buffer) {
        console.log(getTimestamp() + "🔑 Mac.update(ByteBuffer) 被调用");
        logAlgorithm(this.getAlgorithm());
        showStacks();
        printSeparator();
        return this.update(buffer);
    }
    
    mac.update.overload('[B').implementation = function (data) {
        var algorithm = this.getAlgorithm();
        console.log(getTimestamp() + "🔑 Mac.update(byte[]) 被调用");
        logAlgorithm(algorithm);
        
        logData(algorithm + " - 更新数据", data);
        showStacks();
        printSeparator();
        
        return this.update(data);
    }

    mac.update.overload('[B', 'int', 'int').implementation = function (data, offset, len) {
        var algorithm = this.getAlgorithm();
        console.log(getTimestamp() + "🔑 Mac.update(byte[], int, int) 被调用");
        logAlgorithm(algorithm);
        console.log("📍 偏移量: " + offset + ", 长度: " + len);
        
        var slicedData = sliceByteArray(data, offset, len);
        logData(algorithm + " - 更新数据 (切片)", slicedData);
        showStacks();
        printSeparator();
        
        return this.update(data, offset, len);
    }

    mac.doFinal.overload().implementation = function () {
        var algorithm = this.getAlgorithm();
        console.log(getTimestamp() + "🔑 Mac.doFinal() 被调用");
        logAlgorithm(algorithm);
        
        var result = this.doFinal();
        logData(algorithm + " - HMAC 结果", result);
        printSeparator();
        
        return result;
    }

    mac.doFinal.overload('[B').implementation = function (input) {
        var algorithm = this.getAlgorithm();
        console.log(getTimestamp() + "🔑 Mac.doFinal(byte[]) 被调用");
        logAlgorithm(algorithm);
        
        logData(algorithm + " - 最终输入数据", input);
        var result = this.doFinal(input);
        logData(algorithm + " - HMAC 结果", result);
        printSeparator();
        
        return result;
    }

    mac.doFinal.overload('[B', 'int').implementation = function (output, outOffset) {
        var algorithm = this.getAlgorithm();
        console.log(getTimestamp() + "🔑 Mac.doFinal(byte[], int) 被调用");
        logAlgorithm(algorithm);
        console.log("📍 输出偏移量: " + outOffset);
        
        var result = this.doFinal(output, outOffset);
        logData(algorithm + " - HMAC 结果 (写入缓冲区)", output);
        printSeparator();
        
        return result;
    }
    // #endregion

    // ============================================================
    // Cipher Hook (DES/3DES/AES/RSA 等)
    // ============================================================
    var cipher = Java.use("javax.crypto.Cipher");

    // Hook 所有 cipher.init 重载方法
    cipher.init.overload('int', 'java.security.Key').implementation = function (opmode, key) {
        logCipherInitInfo(this, "int, Key", opmode, key);
        return this.init(opmode, key);
    }

    cipher.init.overload('int', 'java.security.cert.Certificate').implementation = function (opmode, cert) {
        logCipherInitInfo(this, "int, Certificate", opmode, cert);
        return this.init(opmode, cert);
    }

    cipher.init.overload('int', 'java.security.Key', 'java.security.AlgorithmParameters').implementation = function (opmode, key, params) {
        logCipherInitInfo(this, "int, Key, AlgorithmParameters", opmode, key, params);
        return this.init(opmode, key, params);
    }

    cipher.init.overload('int', 'java.security.Key', 'java.security.SecureRandom').implementation = function (opmode, key, random) {
        logCipherInitInfo(this, "int, Key, SecureRandom", opmode, key);
        return this.init(opmode, key, random);
    }

    cipher.init.overload('int', 'java.security.Key', 'java.security.spec.AlgorithmParameterSpec').implementation = function (opmode, key, params) {
        logCipherInitInfo(this, "int, Key, AlgorithmParameterSpec", opmode, key, params);
        return this.init(opmode, key, params);
    }

    cipher.init.overload('int', 'java.security.cert.Certificate', 'java.security.SecureRandom').implementation = function (opmode, cert, random) {
        logCipherInitInfo(this, "int, Certificate, SecureRandom", opmode, cert);
        return this.init(opmode, cert, random);
    }

    cipher.init.overload('int', 'java.security.Key', 'java.security.AlgorithmParameters', 'java.security.SecureRandom').implementation = function (opmode, key, params, random) {
        logCipherInitInfo(this, "int, Key, AlgorithmParameters, SecureRandom", opmode, key, params);
        return this.init(opmode, key, params, random);
    }

    cipher.init.overload('int', 'java.security.Key', 'java.security.spec.AlgorithmParameterSpec', 'java.security.SecureRandom').implementation = function (opmode, key, params, random) {
        logCipherInitInfo(this, "int, Key, AlgorithmParameterSpec, SecureRandom", opmode, key, params);
        return this.init(opmode, key, params, random);
    }
    
    // Hook doFinal 方法以捕获加密/解密结果
    cipher.doFinal.overload().implementation = function () {
        var algorithm = this.getAlgorithm();
        console.log(getTimestamp() + "🔒 Cipher.doFinal() 被调用");
        logAlgorithm(algorithm);
        
        var result = this.doFinal();
        logData(algorithm + " - 加密/解密结果", result);
        printSeparator();
        
        return result;
    }
    
    cipher.doFinal.overload('[B').implementation = function (input) {
        var algorithm = this.getAlgorithm();
        console.log(getTimestamp() + "🔒 Cipher.doFinal(byte[]) 被调用");
        logAlgorithm(algorithm);
        
        logData(algorithm + " - 输入数据", input);
        var result = this.doFinal(input);
        logData(algorithm + " - 加密/解密结果", result);
        printSeparator();
        
        return result;
    }
    
    cipher.doFinal.overload('[B', 'int', 'int').implementation = function (input, inputOffset, inputLen) {
        var algorithm = this.getAlgorithm();
        console.log(getTimestamp() + "🔒 Cipher.doFinal(byte[], int, int) 被调用");
        logAlgorithm(algorithm);
        console.log("📍 偏移量: " + inputOffset + ", 长度: " + inputLen);
        
        var slicedInput = sliceByteArray(input, inputOffset, inputLen);
        logData(algorithm + " - 输入数据 (切片)", slicedInput);
        var result = this.doFinal(input, inputOffset, inputLen);
        logData(algorithm + " - 加密/解密结果", result);
        printSeparator();
        
        return result;
    }
    // #endregion

    // ============================================================
    // Signature Hook (RSA/DSA/ECDSA 等数字签名算法)
    // ============================================================
    var signature = Java.use("java.security.Signature");
    
    // Hook initSign - 初始化签名操作（使用私钥）
    signature.initSign.overload('java.security.PrivateKey').implementation = function (privateKey) {
        var algorithm = this.getAlgorithm();
        console.log(getTimestamp() + "✍️ Signature.initSign(PrivateKey) 被调用");
        logAlgorithm(algorithm);
        
        extractPrivateKeyInfo(privateKey, algorithm);
        
        showStacks();
        printSeparator();
        
        return this.initSign(privateKey);
    }
    
    signature.initSign.overload('java.security.PrivateKey', 'java.security.SecureRandom').implementation = function (privateKey, random) {
        var algorithm = this.getAlgorithm();
        console.log(getTimestamp() + "✍️ Signature.initSign(PrivateKey, SecureRandom) 被调用");
        logAlgorithm(algorithm);
        
        extractPrivateKeyInfo(privateKey, algorithm);
        
        showStacks();
        printSeparator();
        
        return this.initSign(privateKey, random);
    }
    
    // Hook initVerify - 初始化验证操作（使用公钥）
    signature.initVerify.overload('java.security.PublicKey').implementation = function (publicKey) {
        var algorithm = this.getAlgorithm();
        console.log(getTimestamp() + "🔍 Signature.initVerify(PublicKey) 被调用");
        logAlgorithm(algorithm);
        
        extractPublicKeyInfo(publicKey, algorithm);
        
        showStacks();
        printSeparator();
        
        return this.initVerify(publicKey);
    }
    
    signature.initVerify.overload('java.security.cert.Certificate').implementation = function (certificate) {
        var algorithm = this.getAlgorithm();
        console.log(getTimestamp() + "🔍 Signature.initVerify(Certificate) 被调用");
        logAlgorithm(algorithm);
        
        try {
            var publicKey = certificate.getPublicKey();
            console.log("📜 证书信息:");
            console.log("   类型: " + certificate.getType());
            extractPublicKeyInfo(publicKey, algorithm);
        } catch (e) {
            console.log("⚠️ 无法获取证书公钥: " + e);
        }
        
        showStacks();
        printSeparator();
        
        return this.initVerify(certificate);
    }
    
    // Hook update - 更新待签名/验证的数据
    signature.update.overload('byte').implementation = function (b) {
        console.log(getTimestamp() + "✍️ Signature.update(byte) 被调用");
        logAlgorithm(this.getAlgorithm());
        showStacks();
        printSeparator();
        return this.update(b);
    }
    
    signature.update.overload('[B').implementation = function (data) {
        var algorithm = this.getAlgorithm();
        console.log(getTimestamp() + "✍️ Signature.update(byte[]) 被调用");
        logAlgorithm(algorithm);
        
        logData(algorithm + " - 待签名/验证数据", data);
        showStacks();
        printSeparator();
        
        return this.update(data);
    }
    
    signature.update.overload('[B', 'int', 'int').implementation = function (data, off, len) {
        var algorithm = this.getAlgorithm();
        console.log(getTimestamp() + "✍️ Signature.update(byte[], int, int) 被调用");
        logAlgorithm(algorithm);
        console.log("📍 偏移量: " + off + ", 长度: " + len);
        
        var slicedData = sliceByteArray(data, off, len);
        logData(algorithm + " - 待签名/验证数据 (切片)", slicedData);
        showStacks();
        printSeparator();
        
        return this.update(data, off, len);
    }
    
    signature.update.overload('java.nio.ByteBuffer').implementation = function (data) {
        console.log(getTimestamp() + "✍️ Signature.update(ByteBuffer) 被调用");
        logAlgorithm(this.getAlgorithm());
        showStacks();
        printSeparator();
        return this.update(data);
    }
    
    // Hook sign - 生成签名
    signature.sign.overload().implementation = function () {
        var algorithm = this.getAlgorithm();
        console.log(getTimestamp() + "✍️ Signature.sign() 被调用");
        logAlgorithm(algorithm);
        
        var result = this.sign();
        logData(algorithm + " - 签名结果", result);
        showStacks();
        printSeparator();
        
        return result;
    }
    
    signature.sign.overload('[B', 'int', 'int').implementation = function (outbuf, offset, len) {
        var algorithm = this.getAlgorithm();
        console.log(getTimestamp() + "✍️ Signature.sign(byte[], int, int) 被调用");
        logAlgorithm(algorithm);
        console.log("📍 输出偏移量: " + offset + ", 长度: " + len);
        
        var result = this.sign(outbuf, offset, len);
        
        var slicedOutput = sliceByteArray(outbuf, offset, result);
        logData(algorithm + " - 签名结果", slicedOutput);
        showStacks();
        printSeparator();
        
        return result;
    }
    
    // Hook verify - 验证签名
    signature.verify.overload('[B').implementation = function (signatureBytes) {
        var algorithm = this.getAlgorithm();
        console.log(getTimestamp() + "🔍 Signature.verify(byte[]) 被调用");
        logAlgorithm(algorithm);
        
        logData(algorithm + " - 待验证的签名", signatureBytes);
        
        var result = this.verify(signatureBytes);
        console.log("🎯 验证结果: " + (result ? "✅ 成功" : "❌ 失败"));
        showStacks();
        printSeparator();
        
        return result;
    }
    
    signature.verify.overload('[B', 'int', 'int').implementation = function (signatureBytes, offset, length) {
        var algorithm = this.getAlgorithm();
        console.log(getTimestamp() + "🔍 Signature.verify(byte[], int, int) 被调用");
        logAlgorithm(algorithm);
        console.log("📍 偏移量: " + offset + ", 长度: " + length);
        
        var slicedSignature = sliceByteArray(signatureBytes, offset, length);
        logData(algorithm + " - 待验证的签名 (切片)", slicedSignature);
        
        var result = this.verify(signatureBytes, offset, length);
        console.log("🎯 验证结果: " + (result ? "✅ 成功" : "❌ 失败"));
        showStacks();
        printSeparator();
        
        return result;
    }
    
    // Hook setParameter - 设置签名参数（较少使用）
    signature.setParameter.overload('java.lang.String', 'java.lang.Object').implementation = function (param, value) {
        var algorithm = this.getAlgorithm();
        console.log(getTimestamp() + "⚙️ Signature.setParameter(String, Object) 被调用");
        logAlgorithm(algorithm);
        console.log("📍 参数名: " + param);
        console.log("📍 参数值: " + value);
        showStacks();
        printSeparator();
        
        return this.setParameter(param, value);
    }
    
    signature.setParameter.overload('java.security.spec.AlgorithmParameterSpec').implementation = function (params) {
        var algorithm = this.getAlgorithm();
        console.log(getTimestamp() + "⚙️ Signature.setParameter(AlgorithmParameterSpec) 被调用");
        logAlgorithm(algorithm);
        console.log("📍 参数类型: " + params.$className);
        showStacks();
        printSeparator();
        
        return this.setParameter(params);
    }
    // #endregion
    
    console.log("✅ Frida 加密 Hook 脚本已加载成功!");
    console.log("📱 监控范围: MessageDigest, Mac, Cipher, Signature");
    console.log("⚙️  配置信息:");
    console.log("   - 显示时间戳: " + (CONFIG.showTimestamp ? "✓" : "✗"));
    console.log("   - 显示调用栈: " + (CONFIG.showStackTrace ? "✓" : "✗"));
    console.log("   - 显示算法名: " + (CONFIG.showAlgorithm ? "✓" : "✗"));
    if (CONFIG.showStackTrace) {
        console.log("   - 堆栈最大行数: " + CONFIG.maxStackLines);
        console.log("   - 过滤系统包数量: " + CONFIG.systemPackages.length);
    }
    printSeparator();
})