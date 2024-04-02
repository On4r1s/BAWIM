import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Admins");
    }

    async getHtml() {
        return `
            <form action="/admins" method="post">
                <div class="input">
                   <label for="admins" style="color: dodgerblue; font-size: large; grid-row: span; grid-column: 1">Admins:</label>
                   <input name="ids" class="can_be_changed" type="text" style="grid-row: span; grid-column: 1" id="admins" value="{{ settings }}"/>
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