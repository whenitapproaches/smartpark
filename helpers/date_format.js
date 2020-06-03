function date_format(date){
    let day = date.getDate()
    let month = date.getMonth() + 1
    let year = date.getFullYear()
    let hour = date.getHours()
    let minute = date.getMinutes()
    minute = (minute < 10) ? `0${minute}` : minute
    let second = date.getSeconds()
    second = (second < 10) ? `0${second}` : second
    return `${hour}:${minute}:${second} ${day}/${month}/${year}`
}

module.exports = date_format