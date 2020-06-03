function time_format(miliseconds){
    let totalSeconds = Math.floor(miliseconds/1000)
    let hour = Math.floor(totalSeconds/(60*60))
    //hour = (hour < 10) ? `0${hour}` : hour
    let minute = Math.floor(totalSeconds/60) - hour*60
    minute = (minute < 10) ? `0${minute}` : minute
    let second = totalSeconds - hour*60*60 - minute*60
    return `${hour}h ${minute}m`
}

module.exports = time_format