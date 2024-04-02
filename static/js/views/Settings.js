import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Settings");
    }

    async getHtml() {
        return `
            <form action="/settings" method="post">
                    <div class="input">
                        <label for="lang" style="grid-row: 1; grid-column: 1">Language: </label>
                        <select name="language" class="can_be_changed" id="lang" style="grid-row: 1; grid-column: 2">
                            <option value="{{ settings['lang'] }}">{{ langs[settings['lang']] }}</option>
                            {% for value in langs %}
                                {% if value != settings['lang'] %}
                                    <option value="{{ value }}">{{ langs[value] }}</option>
                                {% endif %}
                            {% endfor %}
                        </select>
                        <label for="prefix" style="grid-row: 2; grid-column: 1">Prefix: </label>
                        <input name="prefix" class="can_be_changed" type="text" style="grid-row: 2; grid-column: 2" id="prefix"
                               value="{{ settings['prefix'] }}"/>
                        <input type="submit" id="submit">
                    </div>
                </form>
        `;
    }

    async executeViewScript() {
        let submit = document.getElementById("submit");
        submit.addEventListener("mouseover", (e) => {
            e.target.style.background = "#4e5057";
        });
        submit.addEventListener("mouseout", (e) => {
            e.target.style.background = "#36383f";
        });
        let listening = document.getElementsByClassName("can_be_changed");
        for (let i = 0; i < listening.length; i++) {
            listening[i].addEventListener("input", (e) => {
                alert('get fucked moron L');
            });
        }
    }
}