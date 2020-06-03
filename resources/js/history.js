const Axios = require('axios')

const joi = require('@hapi/joi')

const searchInput = document.getElementById("search")

const tbodyCars = document.getElementById("tbodyCars")

const updateTable = () => {
    Axios.get("/history/all", {
        params: {
            search: searchInput.value
        }
    })
    .then((res) => {
        let histories = res.data
        let html = ''
        histories.forEach( (his) => {
                html += `<tr data-id=${his._id}>
                <td>${his._car.plate}</td>
                <td>${his._car.model}</td>
                <td>${his._car.owner}</td>
                <td>${his._car.membership}</td>
                <td>${his.enterTime}</td>
                <td>${his.leaveTime}</td>
                <td>${his.duration}</td>
                <td>${his.slot}</td>
                <td>${his.price}VND</td>
                </tr>
                `
        })
        tbodyCars.innerHTML = html
    })
    .catch((err) => {
        console.log(err)
    })
}

searchInput.onkeyup = updateTable

updateTable()

