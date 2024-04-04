import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Personalize");
    }

    async getHtml() {
        return `
            <div class="image_input">
                <img src="" id="my_img" alt="img" width="150px" height="150px" style="align-self: center; border-radius: 75px;">
                <label class="custom-file-upload" for="img" id="img-view">Update Image</label>
                <input class="can_be_changed" type="file" id="img" name="img" accept="image/*">
            </div>
            <div class="input">
                <label for="Name" style="grid-row: 1; grid-column: 1">Bot Name: </label>
                <input class="can_be_changed" name="name" type="text" style="grid-row: 1; grid-column: 2" id="Name" value=""/>
                <label for="Status" style="grid-row: 2; grid-column: 1">Status: </label>
                <select class="can_be_changed" name="status" id="Status" style="grid-row: 2; grid-column: 2"></select>
                <label for="Activity" style="grid-row: 3; grid-column: 1">Activity: </label>
                <select class="can_be_changed" name="activity" id="Activity" style="grid-row: 3; grid-column: 2"></select>
                <label for="act_text" style="grid-row: 4; grid-column: 1">Activity text: </label>
                <input class="can_be_changed" name="act_text" type="text" style="grid-row: 4; grid-column: 2" value="" id="act_text"/>
            </div>
        `;
    }

    async executeViewScript(json) {
        //let submit = document.getElementById("submit");
        //submit.addEventListener("mouseover", (e) => {
        //    e.target.style.background = "#4e5057";
        //});
        let img_button = document.getElementById("img-view");
        img_button.addEventListener("mouseover", (e) => {
            e.target.style.background = "#4e5057";
        });
        img_button.addEventListener("mouseout", (e) => {
            e.target.style.background = "#36383f";
        });
        let listening = document.getElementsByClassName("can_be_changed");
        for (let i = 0; i < listening.length; i++) {
            listening[i].addEventListener("input", (e) => {
                alert('get fucked moron L');
            });
        }
        //inserting values
        const status_list = ["online", "idle", "dnd"]
        const status = {
            "online": "🟢 Online",
            "idle": "🟡 Idle",
            "dnd": "🔴 Do not disturb"
        }
        const activity = ['playing', 'streaming', 'listening', 'watching', 'competing']
        document.getElementById("my_img").src = json.avatar
        document.getElementById("Name").value = json.name
        var select = document.createElement('option')
        select.value = json.status
        select.text = status[json.status]
        document.getElementById("Status").append(select)
        for (let i = 0; i < status_list.length; i++) {
            if (status_list[i] !== json.status) {
                select = document.createElement('option')
                select.value = status_list[i]
                select.text = status[status_list[i]]
                document.getElementById("Status").append(select)
            }
        }
        select = document.createElement('option')
        select.value = json.activity
        select.text = json.activity
        document.getElementById("Activity").append(select)
        for (let i = 0; i < activity.length; i++) {
            if (activity[i] !== json.activity) {
                select = document.createElement('option')
                select.value = activity[i]
                select.text = activity[i]
                document.getElementById("Activity").append(select)
            }
        }
        document.getElementById("act_text").value = json.activity_text
    }
}