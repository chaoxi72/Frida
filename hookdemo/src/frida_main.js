Java.perform ( function () {

    // function showStack () {
    //     console.log(
    //         Java.use("android.util.log").getStackTraceString(
    //             Java.use("java.lang.Throwable").$new()
    //         )
    //     );
        
    // }

    // var util = Java.use("com.xiaojianbang.hook.Utils");
    // var overloadsArr = util.getCalc.overloads;
    // for (var i = 0; i < overloadsArr.length; i++) {
    //     overloadsArr[i].implementation = function () {
    //         showStack();
    //         var params = "";
    //         for (var j = 0; j < arguments.length; j++) {
    //             params += arguments[j] + " ";
    //         }
    //         console.log("utils.getCalc is called! param is: ", params);
            
    //         console.log(this);
    //         return this.getCalc.apply(this, arguments);
    //     }
    // }
    // console.log(Java.enumerateLoadedClassesSync().join("\n"));

    // var wallet = Java.use("com.xiaojianbang.hook.Wallet");
    // var methods = wallet.class.getDeclaredMethods();
    // var constructors = wallet.class.getDeclaredConstructors();
    // var fields = wallet.class.getDeclaredFields();
    // var classes = wallet.class.getDeclaredClasses();

    // for (let i = 0; i < methods.length; i++){
    //     console.log(methods[i].getName());
    // }
    // console.log("================================");
    // for(let i = 0; i < constructors.length; i++) {
    //     console.log(constructors[i].getName());
    // }
    // console.log("================================");
    // for(let i = 0; i < fields.length; i++) {
    //     console.log(fields[i].getName());
    // }
    // console.log("================================");
    // for (let i = 0; i < classes.length; i++) {
    //     console.log(classes[i].getName());
    //     var Wallet$InnerStructure = classes[i].getDeclaredFields();
    //     for (let j = 0; j < Wallet$InnerStructure.length; j++) {
    //         console.log(Wallet$InnerStructure[j].getName());
    //     }
    // }

    // function hookFunc (methodName) {
    //     console.log(methodName);
    //     var overloadArr = utils[methodName].overloads;
    //     for(var j = 0; j < overloadArr.length; j ++)
    //     {
    //         overloadArr[j].implementation = function () {
    //             var params = "";
    //             for (var k = 0; k < arguments.length; k++) {
    //                 params += arguments[k] + " ";
    //             }
    //             console.log("utils." + methodName + " is called! params is: ", params);
    //             return this[methodName].apply(this,arguments);
    //         }
    //     }
    // }
    // var utils = Java.use("com.xiaojianbang.hook.Utils");
    // var methods = utils.class.getDeclaredMethods();
    // for (var i = 0; i < methods.length; i ++)
    // {
    //     var methodName = methods[i].getName();
    //     hookFunc(methodName);
    // }

    // const MyWeirdTrustManager = Java.registerClass({
    //     name: "com.xiaojianbang.app.MyRegisterClass",
    //     implements: [Java.use("com.xiaojianbang.app.TestRegisterClass")],
    //     fields: {
    //         decription: "java.lang.String",
    //         limit: "int",
    //     },
    //     methods: {
    //         $init() {
    //             console.log('Constructor called');
    //         },
    //         test1: [{
    //             returnType: 'void',
    //             argumentTypes: [],
    //             implementation() {
    //                 console.log('test1 called');
    //             }
    //         }, {
    //             returnType: 'void',
    //             argumentTypes: ['java.lang.String', 'int'],
    //             implementation(str, num) {
    //                 console.log('test1(str, num) called', str, num);
    //             }
    //         }],
    //         test2(str, num) {
    //             console.log('test2(str, num) called', str, num);
    //             return null;
    //         }
    //     }
    // });
    // var myObj = MyWeirdTrustManager.$new();
    // myObj.test1();
    // myObj.test1("xiaojianbang1", 100);
    // myObj.test2("xiaojianbang2", 200);
    // myObj.limit.value = 10000;
    // console.log(myObj.limit.value);

    // var utils = Java.use("com.xiaojianbang.hook.Utils");
    // // var retval = utils.myPrint(["xiaojianbang", "Frida", "Hook"]);
    // var strarr = Java.array(
    //     "Ljava.lang.String;",
    //     ["xiaojianbang", Bool.$new(false), "22"]
    // )
    // var retval = utils.myPrint(strarr);
    // console.log(retval);

    // var Dynamic = Java.use("com.xiaojianbang.app.Dynamic");
    // Dynamic.sayHello.implementation = function () {
    //     console.log("this func is called");
    //     return "Hello";
    // }

    // Java.enumerateClassLoaders({
    //     onMatch: function (loader) {
    //         try{
    //             Java.classFactory.loader = loader;
    //             var dynamic = Java.use("com.xiaojianbang.app.Dynamic");
    //             console.log("dynamic", dynamic);
    //             dynamic.sayHello.implementation = function () {
    //                 console.log("hook dynamic.sayhello is run");
    //                 return "Hello"
    //             }
    //         }
    //         catch (e) {
    //             console.log(loader);
    //         }
    //     },
    //     onComplete: function() {}
    // })

    // var mainActivity = Java.use("com.xiaojianbang.app.MainActivity");
    // var stringBuilder = Java.use("java.lang.StringBuilder");

    // mainActivity.generateAESKey.implementation = function () {
    //     console.log("mainActivity.generateAESKey is called");
    //     stringBuilder.toString.implementation = function () {
    //         var result = this.toString();
    //         console.log(result);
    //         return result;
    //     };
    //     var result = this.generateAESKey.apply(this, arguments);
    //     stringBuilder.toString.implementation = null;
    //     return result;
    // }

    var classes = Java.enumerateLoadedClassesSync();
    for (const index in classes) {
        let className = classes[index];
        if (className.indexOf("com.xiaojianbang") === -1) continue;
        let clazz = Java.use(className);
        //  getSuperclass
        let resultArr = clazz.class.getInterfaces();

        if (resultArr.length === 0) continue;
        for (let i = 0; i < resultArr.length; i++) {
            if (resultArr[i].toString().indexOf("com.xiaojianbang.TestRegisterClass") !== -1) {
                console.log(className, resultArr);
            }
        }
    }
})