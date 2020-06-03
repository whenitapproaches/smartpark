function Notification(el) {
    this.element = el
    let bg = el.querySelector(".modal-background")
    if(bg) bg.onclick = this.close
    this.timeout
}

Notification.prototype = {
    open: function() {
        clearTimeout(this.timeout)
        this.element.classList.add("is-active")
        this.timeout = setTimeout(this.close.bind(this), 2000)
    },
    close: function() {
        this.element.classList.remove("is-active")
    },
    toggle: function(){
        this.element.classList.toggle("is-active")
    },
    error: function(msg){
        this.element.innerText = msg
        this.element.classList.remove("is-success")
        this.element.classList.add("is-danger")
        return this
    },
    success: function(msg){
        this.element.innerText = msg
        this.element.classList.remove("is-danger")
        this.element.classList.add("is-success")
        return this
    }
}

let el = document.querySelector(".notification")
const messageNotification = new Notification(el)
