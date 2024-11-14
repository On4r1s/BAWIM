import AbstractView from "./AbstractView.js"
import {ShSaveChangesMenu, shInfoMenu} from "../utils.js"

let myJSON, myAvatar

export default class extends AbstractView {
    constructor(params) {
        super(params)
        this.setTitle("Personalize")
    }

    async getHtml() {
        return `
            <div class="image-input">
                <img class="can-be-changed" src="" id="img" alt="user avatar">
                <label class="custom-file-upload" for="avatar" id="img-view">Update Image</label>
                <input class="can-be-changed" type="file" id="avatar" name="avatar" accept=".jpg, .jpeg, .png, .gif" width="150px" height="150px">
            </div>
            <div class="input">
                <label for="name" style="grid-row: 1; grid-column: 1">Bot name: </label>
                <input class="can-be-changed" name="name"  id="name" type="text" style="grid-row: 1; grid-column: 2" value=""/>
                <label for="status" style="grid-row: 2; grid-column: 1">Status: </label>
                <select class="can-be-changed" name="status" id="status" style="grid-row: 2; grid-column: 2"></select>
                <label for="activity" style="grid-row: 3; grid-column: 1">Activity: </label>
                <select class="can-be-changed" name="activity" id="activity" style="grid-row: 3; grid-column: 2"></select>
                <label for="activity-text" style="grid-row: 4; grid-column: 1">Activity text: </label>
                <input class="can-be-changed" name="activity-text" type="text" style="grid-row: 4; grid-column: 2" value="" id="activity-text"/>
            </div>
        `
    }

    async executeViewScript(json, jsonCopy, wasntChangedOther, avatar) {
        myJSON = jsonCopy
        myAvatar = avatar
        ShSaveChangesMenu(wasntChangedOther, myJSON, json)
        const avatarEl = document.getElementById('avatar')
        const nameEl = document.getElementById('name')
        const statusEl = document.getElementById("status")
        const activityEl = document.getElementById("activity")
        const activityTextEl = document.getElementById('activity-text')

        // input + validation
        const forbiddenWords = ['everyone', 'here', 'discord']

        avatarEl.addEventListener('change', (e) => {
            const file = e.target.files[0]
            if (!file.type.match('image.*')) {
                shInfoMenu('Error: The selected file does not appear to be an png/jpeg/jpg/gif.', '#e33a3f')
                return
            }
            if (file.size > 8000000) {
                shInfoMenu('Error: image is too big, make it under 8mb.', '#e33a3f')
                return
            }
            const reader = new FileReader()
            reader.addEventListener('load', e => {
                const image = new Image()
                image.onload = function () {
                    if (this.width) {
                        document.getElementById('img').src = e.target.result
                        myAvatar = e.target.result
                        myJSON['avatar'] = 'newAvatar'
                        ShSaveChangesMenu(wasntChangedOther, myJSON, json)
                    }
                }
                image.onerror = function () {
                    shInfoMenu('Invalid image', '#e33a3f')
                }
                image.src = e.target.result
            })
            reader.readAsDataURL(file)
        })

        nameEl.addEventListener("input", () => {
            const regChars = /^[^\s\0@#:"'`\x07\x08\x0B\x0C\x0E-\x1F]{1,100}$/
            const val = nameEl.value
            if (!((2 <= val.length) && (32 >= val.length))) {
                nameEl.setCustomValidity("must be 2-32 characters")
                nameEl.reportValidity()
            } else if (!(regChars.test(val))) {
                nameEl.setCustomValidity("illegal character(s)")
                nameEl.reportValidity()
            } else if (forbiddenWords.includes(val)) {
                nameEl.setCustomValidity("illegal word(s)")
                nameEl.reportValidity()
            } else {
                nameEl.setCustomValidity("")
                myJSON['name'] = val
                ShSaveChangesMenu(wasntChangedOther, myJSON, json)
            }
        })

        statusEl.addEventListener("input", () => {
            myJSON['status'] = statusEl.value
            ShSaveChangesMenu(wasntChangedOther, myJSON, json)
        })

        activityEl.addEventListener("input", () => {
            myJSON['activity'] = activityEl.value
            ShSaveChangesMenu(wasntChangedOther, myJSON, json)
        })

        activityTextEl.addEventListener("input", () => {
            const regChars = /^[^\0@#:"'`\x07\x08\x0B\x0C\x0E-\x1F]{1,100}$/
            const val = activityTextEl.value
            if (!((1 <= val.length) && (100 >= val.length))) {
                activityTextEl.setCustomValidity("must be 1-100 characters")
                activityTextEl.reportValidity()
            } else if (!(regChars.test(val))) {
                activityTextEl.setCustomValidity("illegal character(s)")
                activityTextEl.reportValidity()
            } else {
                activityTextEl.setCustomValidity("")
                myJSON['activity_text'] = val
                ShSaveChangesMenu(wasntChangedOther, myJSON, json)
            }
        })

        // inserting values
        const statusList = ["online", "idle", "dnd"]
        const status = {
            "online": "🟢 Online",
            "idle": "🟡 Idle",
            "dnd": "🔴 Do not disturb"
        }
        const activity = ['playing', 'streaming', 'listening', 'watching', 'competing']

        document.getElementById("img").src = 'upload/' + avatar
        nameEl.value = myJSON.name
        let select = document.createElement('option')
        select.value = myJSON.status
        select.text = status[myJSON.status]
        statusEl.append(select)
        for (let i = 0; i < statusList.length; i++) {
            if (statusList[i] !== myJSON.status) {
                select = document.createElement('option')
                select.value = statusList[i]
                select.text = status[statusList[i]]
                statusEl.append(select)
            }
        }
        select = document.createElement('option')
        select.value = myJSON.activity
        select.text = myJSON.activity
        activityEl.append(select)
        for (let i = 0; i < activity.length; i++) {
            if (activity[i] !== myJSON.activity) {
                select = document.createElement('option')
                select.value = activity[i]
                select.text = activity[i]
                activityEl.append(select)
            }
        }
        activityTextEl.value = myJSON['activity_text']
    }

    async getInputValues() {
        return [myJSON, myAvatar]
    }
}