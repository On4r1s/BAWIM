import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Personalize");
    }

    async getHtml() {
        return `
            <form action="/personalize" method="post">
                    <div class="image_input">
                        <img src="" id="my_img"
                             alt="img" width="150px" height="150px" style="align-self: center; border-radius: 75px;">
                        <label class="custom-file-upload" for="img" id="img-view">Update Image</label>
                        <input class="can_be_changed" type="file" id="img" name="img" accept="image/*">
                    </div>
                    <div class="input">
                        <label for="Name" style="grid-row: 1; grid-column: 1">Bot Name: </label>
                        <input class="can_be_changed" name="name" type="text" style="grid-row: 1; grid-column: 2" id="Name"
                               value="{{ settings['name'] }}"/>
                        <label for="Status" style="grid-row: 2; grid-column: 1">Status: </label>
                        <select class="can_be_changed" name="status" id="Status" style="grid-row: 2; grid-column: 2">
                            <option value="{{ settings['status'] }}">{{ status[settings['status']] }}</option>
                            {% for key, value in status.items() %}
                                {% if key != settings['status'] %}
                                    <option value="{{ key }}">{{ value }}</option>
                                {% endif %}
                            {% endfor %}
                        </select>
                        <label for="Activity" style="grid-row: 3; grid-column: 1">Activity: </label>
                        <select class="can_be_changed" name="activity" id="Activity" style="grid-row: 3; grid-column: 2">
                            <option value="{{ settings['activity'] }}">{{ settings['activity'].title() }}</option>
                            {% for value in activity %}
                                {% if value != settings['activity'] %}
                                    <option value="{{ value }}">{{ value.title() }}</option>
                                {% endif %}
                            {% endfor %}
                        </select>
                        <label for="act_text" style="grid-row: 4; grid-column: 1">Activity text: </label>
                        <input class="can_be_changed" name="act_text" type="text" style="grid-row: 4; grid-column: 2" value="{{ settings['activity_text'] }}"
                               id="act_text"/>
                        <input type="submit" id="submit">
                    </div>
            </form>
        `;
    }

    async executeViewScript(img) {
        let submit = document.getElementById("submit");
        submit.addEventListener("mouseover", (e) => {
            e.target.style.background = "#4e5057";
        });
        submit.addEventListener("mouseout", (e) => {
            e.target.style.background = "#36383f";
        });
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
        document.getElementById("my_img").src = img
    }
}