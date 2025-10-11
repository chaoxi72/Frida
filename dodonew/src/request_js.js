import MD5 from 'crypto-js/md5.js';
import CryptoJS from 'crypto-js';

function getSign(user, pwd, time) {
    var str = "equtype=ANDROID&loginImei=Androidnull&timeStamp=" + time +"&userPwd=" + pwd + "&username=" + user + "&key=sdlkjsdljf0j2fsjk";
    return MD5(str).toString();
}

function getData(user, pwd) {
    // var time = new Date().getTime();
    var time = '1760067967866';
    var sign = getSign(user, pwd, time);
    var data =  '{"equtype": "ANDROID", "loginImei": "Androidnull", "sign": "' + sign + '", "timeStamp":"' + time + '","userPwd":"' + pwd + '","username":"' + user + '"}';
    var keyMD5 = MD5("65102933");
    var key = CryptoJS.enc.Hex.parse(keyMD5.toString());
    var iv = CryptoJS.enc.Utf8.parse("32028092");
    return CryptoJS.DES.encrypt(data, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    }).toString();
}

console.log(getData("198196235678", "123456"));