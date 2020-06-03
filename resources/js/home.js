import Axios from 'axios'
import FormData from 'form-data'

const slot = document.querySelectorAll(".slot[data-slot]")
const owner_owner = document.getElementById("owner__owner")
const owner_model = document.getElementById("owner__model")
const owner_plate = document.getElementById("owner__plate")
const owner_membership = document.getElementById("owner__membership")
const info_lastLeaving = document.getElementById("info__lastLeaving")
const info_lastEntering = document.getElementById("info__lastEntering")
const info_timeElapsed = document.getElementById("info__timeElapsed")
const info_parkingFee = document.getElementById("info__parkingFee")
const info_slot = document.getElementById("info__slot")
const carInfo = document.getElementById("carInfo")

slot.forEach((el) => {
    el.onclick = () => {
        slot.forEach( (ele) => {
            ele.classList.remove("is-chosen")
        })
        el.classList.toggle("is-chosen")
        Axios.post("/cars/get/slot", {
            slot: el.dataset.slot
        })
        .then( (res) => {
            if(!res.data.plate) throw Error("Nothing found")
            carInfo.classList.remove("hidden")
            owner_owner.innerText = res.data.owner
            owner_model.innerText = (res.data.model) ? res.data.model : 'N/A'
            owner_plate.innerText = res.data.plate
            owner_membership.innerText = res.data.membership
            info_lastEntering.innerText = res.data.lastEnteringDate
            info_lastLeaving.innerText = res.data.lastLeavingDate
            info_timeElapsed.innerText = res.data.timeElapsed
            info_parkingFee.innerText = res.data.parkingFee
            info_slot.innerText = res.data.slot
        })
        .catch( (err) => {
            carInfo.classList.add("hidden")
        })
    }
})



const input = document.querySelector("#uploader")

const result = document.getElementById("result")

const xmin_limit = 300
const xmax_limit = 700
const ymin_limit = 300
const ymax_limit = 500

const image_width = 1000;
const image_height = 1000;

input.onchange = () => {
    if(input.files.length > 0) {
        const formData = new FormData()
        let file = input.files[0]
        formData.append("image", file)
        // Axios({
        //     method: 'post',
        //     url: 'check',
        //     data: formData,
        //     headers: {
        //         'Content-Type': 'multipart/form-data'
        //     }
        // })
        // .then( (res) => {
        //     console.log(res.data)
        //     result.innerText = res.data
        // })
        result.innerText = "Loading..."
        Axios({
            method: 'post',
            url: 'check1',
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        .then( (res) => {
            console.log(res.data)
            let objects = res.data
            let plates = []
            for(let obj of objects) {
                if(obj.hasOwnProperty("plate")) plates.push(obj)
            }
            console.log(plates)
            for(let plate of plates) {
                
            }
        })
        .catch( (err) => {
            console.log(err)
            result.innerText = "Error"
        })
    }

}