Java.perform(function () {
    function showStacks() {
        console.log(
            Java.use("android.util.Log").getStackTraceString(
                Java.use("java.lang.Throwable").$new()
            )
        );        
    }

    var toast = Java.use("android.widget.Toast");
    toast.show.implementation = function () {
        showStacks();
        console.log("toast.show: ");
        return this.show();
    }
})