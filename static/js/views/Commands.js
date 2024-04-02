import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Commands");
    }

    async getHtml() {
        return `
            <form action="/commands" method="post">
                    <div class="input">
                        {% for value in settings %}
                            {% if settings[value].__len__() != 0 %}
                                <b style="color: dodgerblue; font-size: large; grid-row: span; grid-column: 1">{{ value.title() }}:</b>
                                {% for com in settings[value] %}
                                    <label for="{{ com }}"
                                           style="grid-row: span; grid-column: 1">{{ com.replace("_", " ").replace("command", "") }}: </label>
                                    <label style="grid-row: span; grid-column: 2" class="switch">
                                    {% if settings[value][com] == 1 %}
                                        <input class="can_be_changed" name="{{ com }}" id="{{ com }}" style="grid-row: span; grid-column: 2" type="checkbox" checked>
                                    {% else %}
                                        <input class="can_be_changed" name="{{ com }}" id="{{ com }}" style="grid-row: span; grid-column: 2" type="checkbox">
                                    {% endif %}
                                        <span style="grid-row: span; grid-column: 2" class="slider round"></span>
                                    </label>
                                {% endfor %}
                            {% endif %}
                        {% endfor %}
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