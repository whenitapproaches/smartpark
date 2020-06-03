const Axios = require('axios')

const joi = require('@hapi/joi')

const isParkingOptions = document.getElementById("isParkingOptions")
const searchInput = document.getElementById("search")
const carUpdateSchema = new joi.object({
    owner: joi.string().min(5).max(30).required(),
    model: joi.string().max(30),
    plate: joi.string().min(7).max(8).required(),
    membership: joi.string(),
    slot: joi.string()
})

const tbodyCars = document.getElementById("tbodyCars")

const updateFunctionality = () => {
    const rows = document.querySelectorAll("tr[data-id]")
    rows.forEach((row) => {
        let id = row.dataset.id
        let updateButton = row.querySelector("button.update")
        let leaveButton = row.querySelector("button.leave")
        let removeButton = row.querySelector("button.remove")
        let enterButton = row.querySelector("button.enter")
        let inputs = row.querySelectorAll("input")
        let selects = row.querySelectorAll("select")

        inputs.forEach((input) => { 
            input.addEventListener("keyup", function() {
                let data = getInputsValue(inputs)
                console.log(data)
                const {error} = validate(data)
                input.classList.remove("is-danger")
                if(error) {
                    error.details.forEach((err) => {
                        inputs.forEach((input) => {
                            if(input.name == err.context.key) input.classList.add("is-danger")
                        })
                    })
                }
            })
        })
        updateButton.onclick = (e) => {
            e.preventDefault()
            Axios.put("/cars/", {
                data: {
                    _id: id,
                    ...getInputsValue(inputs),
                    ...getSelectsValue(selects)
                }
            })
            .then( (res) => {
                messageNotification.success(res.data)
                messageNotification.open()
                updateTable()
            })
            .catch( (err) => {
                if(err.response) {
                    messageNotification.error(err.response.data.message)
                    messageNotification.open()
                    if(err.response.data.key) {
                        inputs.forEach((input) => {
                            if(input.name == err.response.data.key) input.classList.add("is-danger")
                        })
                    }
                }
            })
        }
        removeButton.onclick = (e) => {
            e.preventDefault()
            modal.open()
            modal.resetConfirm()
            modal.confirm.addEventListener("click", () => {
                Axios.delete("/cars/", {
                    data: {
                        _id: id
                    }
                })
                .then( (res) => {
                    messageNotification.success(res.data)
                    messageNotification.open()
                    updateTable()
                })
                .catch( (err) => {
                    if(err.response) {
                        messageNotification.error(err.response.data.message)
                        messageNotification.open()
                    }
                })
            })

        }
        enterButton.onclick = (e) => {
            let input = row.querySelector("input[name=lastEntering]")
            let inputIsParking = row.querySelector("input[name=isParking")
            let inputSlot = row.querySelector("input[name=slot]")
            let penter = row.querySelector("p.enter")
            let pisparking = row.querySelector("p.is-parking")
            let val = inputIsParking.value
            if(val == 'false') {
                penter.innerText = `Entering...`
                pisparking.innerText = "Yes"
                inputIsParking.value = true
                inputSlot.removeAttribute("disabled")
                input.value = Date.now()
            }
        }
        leaveButton.onclick = (e) => {
            let input = row.querySelector("input[name=lastLeaving]")
            let inputIsParking = row.querySelector("input[name=isParking")
            let inputSlot = row.querySelector("input[name=slot]")
            let penter = row.querySelector("p.leave")
            let pisparking = row.querySelector("p.is-parking")
            let val = inputIsParking.value
            if(val == 'true') {
                penter.innerText = `Leaving...`
                inputSlot.value = ''
                inputSlot.setAttribute("disabled", true)
                pisparking.innerText = "No"
                inputIsParking.value = false
                input.value = Date.now()
            }
        }
    })
}

const insertFunctionality = () => {
    const insertRow = document.querySelector("tr#registerCar")
    const insertButton = insertRow.querySelector("button.insert")
    let inputs = {
        plate: insertRow.querySelector("input[name=plate]"),
        model: insertRow.querySelector("input[name=model]"),
        owner: insertRow.querySelector("input[name=owner]"),
        membership: insertRow.querySelector("select[name=membership]"),
        isParking: insertRow.querySelector("select[name=isParking]")
    }
    insertButton.onclick = (e) => {
        e.preventDefault()
        Axios.post("/cars/register", {
            data: {
                plate: inputs.plate.value,
                model: inputs.model.value,
                owner: inputs.owner.value,
                membership: inputs.membership.value
            }
        })
        .then( (res) => {
            messageNotification.success(res.data)
            messageNotification.open()
            updateTable()
        })
        .catch( (err) => {
            if(err.response) {
                messageNotification.error(err.response.data.message)
                messageNotification.open()
            }
        })
    }
}


const validate = (data) => {
    return carUpdateSchema.validate(data)
}

const getInputsValue = (inputs) => {
    const returnObj = {}
    inputs.forEach((input) => {
        returnObj[input.name] = input.value
    })
    return returnObj
}

const getSelectsValue = (selects) => {
    const returnObj = {}
    selects.forEach( (select) => {
        returnObj[select.name] = select.value
    })
    return returnObj
}

const updateTable = () => {
    let isParkingOptionsValue = isParkingOptions.querySelector("input").value

    Axios.get("/cars/all", {
        params: {
            isParkingOptions: isParkingOptionsValue,
            search: searchInput.value
        }
    })
    .then((res) => {
        let carsData = res.data
        let html = ''
        carsData.forEach( (car) => {
            html += `<tr data-id=${car._id}>
            <td><input class="input" name="plate" type="text" value="${car.plate}"></td>
            <td><input class="input" name="model" type="text" value="${car.model}"></td>
            <td><input class="input" name="owner" type="text" value="${car.owner}"></td>
            <td>
                <div class="field">
                    <div class="control">
                        <div class="select">
                            <select name="membership">
                                <option value="basic"${(car.membership == 'basic') ? "selected" : ''}>Basic</option>
                                    <option value="premium"${(car.membership == 'premium') ? "selected" : ''}>Premium</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </td>
            <td><p class="enter">${car.lastEnteringDate}</p><input name="lastEntering" type="hidden" value="${(car.lastEntering) ? car.lastEntering : ''}"></td>
            <td><p class="leave">${car.lastLeavingDate}</p><input name="lastLeaving" type="hidden" value="${(car.lastLeaving) ? car.lastLeaving : ''}"></td>
            <td><p class="is-parking">${(car.isParking) ? "Yes" : 'No'}</p><input name="isParking" type="hidden" value="${car.isParking}"></td>
            <td><input class="input" name="slot" type="text" size=2 value="${car.slot}"${(!car.isParking) ? " disabled" : ''}></td>
            <td><button class="button is-link enter"${(car.isParking) ? " disabled" : ''}>Enter</button></td>
            <td><button class="button is-warning leave"${(!car.isParking) ? " disabled" : ''}>Leave</button></td>
            <td><button class="button is-success update"><span class="icon"><i class="fi fi-save"></i></span></button></td>
            <td><button class="button is-danger remove"><span class="icon"><i class="fi fi-trash"></i></span></td> 
            </tr>
            `
        })
        tbodyCars.innerHTML = html + `<tr id="registerCar">
        <td><input class="input" name="plate" type="text" value=""></td>
            <td><input class="input" name="model" type="text" value=""></td>
            <td><input class="input" name="owner" type="text" value=""></td>
            <td>
                <div class="field">
                    <div class="control">
                        <div class="select">
                            <select name="membership">
                                <option value="basic" selected>Basic</option>
                                <option value="premium">Premium</option>
                            </select>
                        </div>
                    </div>
                </div>
            </td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td><button class="button is-success insert"><span class="icon"><i class="fi fi-plus-a"></i></span></button></td>
    </tr>`
        updateFunctionality()
        insertFunctionality()
    })
    .catch((err) => {
        console.log(err)
    })
}


function Modal(el) {
    this.element = el
    let bg = el.querySelector(".modal-background")
    let cancel = el.querySelector("button.cancel")
    this.confirm = el.querySelector("button.confirm")
    bg.onclick = this.close.bind(this)
    cancel.onclick = this.close.bind(this)
    this.confirm.onclick = this.close.bind(this)
}

Modal.prototype = {
    open: function() {
        this.element.classList.add("is-active")
    },
    close: function() {
        this.element.classList.remove("is-active")
    },
    toggle: function(){
        this.element.classList.toggle("is-active")
    },
    resetConfirm: function(){
        var old_element = this.confirm
        var new_element = old_element.cloneNode(true)
        old_element.parentNode.replaceChild(new_element, old_element)
        this.confirm = new_element
        this.confirm.onclick = this.close.bind(this)
    }
}


function Notification(el) {
    this.element = el
    this.timeout
}

Notification.prototype = {
    open: function() {
        clearTimeout(this.timeout)
        this.element.classList.add("is-active")
        this.timeout = setTimeout(this.close.bind(this), 2500)
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
    },
    success: function(msg){
        this.element.innerText = msg
        this.element.classList.remove("is-danger")
        this.element.classList.add("is-success")
    }
}

let el = document.querySelector(".notification")
const messageNotification = new Notification(el)
el = document.querySelector(".modal")
const modal = new Modal(el)

const refreshButton = document.querySelector("button.refresh")
refreshButton.onclick = updateTable

isParkingOptions.onclick = () => {
    let isParkingOptionsValue = +isParkingOptions.querySelector("input").value
    let x = ++isParkingOptionsValue
    if(x > 2) x = 0
    isParkingOptions.querySelector("input").value = x
    updateTable()
}
searchInput.onkeyup = updateTable

updateTable()

