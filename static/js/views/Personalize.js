import AbstractView from "./AbstractView.js";

let myJSON
let newAvatar

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Personalize");
    }

    async getHtml() {
        return `
            <div class="image_input">
                <img src="" id="avatar" alt="user avatar" value="" width="150px" height="150px">
                <label class="custom-file-upload" for="img" id="img-view">Update Image</label>
                <input class="can_be_changed" type="file" id="img" name="img" accept=".jpg, .jpeg, .png .gif">
            </div>
            <div class="input">
                <label for="name" style="grid-row: 1; grid-column: 1">Bot Name: </label>
                <input class="can_be_changed" name="name"  id="name" type="text" style="grid-row: 1; grid-column: 2" value=""/>
                <label for="status" style="grid-row: 2; grid-column: 1">Status: </label>
                <select class="can_be_changed" name="status" id="status" style="grid-row: 2; grid-column: 2"></select>
                <label for="activity" style="grid-row: 3; grid-column: 1">Activity: </label>
                <select class="can_be_changed" name="activity" id="activity" style="grid-row: 3; grid-column: 2"></select>
                <label for="activity_text" style="grid-row: 4; grid-column: 1">Activity text: </label>
                <input class="can_be_changed" name="activity_text" type="text" style="grid-row: 4; grid-column: 2" value="" id="activity_text"/>
            </div>
        `;
    }

    async executeViewScript(json, avatar) {
        myJSON = json
        newAvatar = avatar
        let img_button = document.getElementById("img-view");
        img_button.addEventListener("mouseover", (e) => {
            e.target.style.background = "#4e5057";
        });
        img_button.addEventListener("mouseout", (e) => {
            e.target.style.background = "#36383f";
        });
        //inserting values
        const status_list = ["online", "idle", "dnd"]
        const status = {
            "online": "🟢 Online",
            "idle": "🟡 Idle",
            "dnd": "🔴 Do not disturb"
        }
        const activity = ['playing', 'streaming', 'listening', 'watching', 'competing']
        if (avatar !== undefined) {
            document.getElementById("avatar").src = avatar
        } else {
            document.getElementById("avatar").src = json.avatar
        }
        document.getElementById("name").value = json.name
        let select = document.createElement('option')
        select.value = json.status
        select.text = status[json.status]
        document.getElementById("status").append(select)
        for (let i = 0; i < status_list.length; i++) {
            if (status_list[i] !== json.status) {
                select = document.createElement('option')
                select.value = status_list[i]
                select.text = status[status_list[i]]
                document.getElementById("status").append(select)
            }
        }
        select = document.createElement('option')
        select.value = json.activity
        select.text = json.activity
        document.getElementById("activity").append(select)
        for (let i = 0; i < activity.length; i++) {
            if (activity[i] !== json.activity) {
                select = document.createElement('option')
                select.value = activity[i]
                select.text = activity[i]
                document.getElementById("activity").append(select)
            }
        }
        document.getElementById("activity_text").value = json.activity_text
        // checking img input
        const error = document.getElementById('error')
        const output = document.getElementById('avatar')
        document.getElementById('img').addEventListener('change', e => {
            error.textContent = ''
            const file = e.target.files[0]
            if (!file.type.match('image.*')) {
                error.textContent = 'Error: The selected file does not appear to be an png/jpg/gif.'
                return
            }
            const reader = new FileReader()
            reader.addEventListener('load', e => {

                output.src = e.target.result
                newAvatar = e.target.result
            })
            reader.readAsDataURL(file)
        })
    }

    async getInputValues() {
        for (let key in myJSON) {
            myJSON[key] = document.getElementById(key).value
        }
        return [myJSON, newAvatar]
    }
}