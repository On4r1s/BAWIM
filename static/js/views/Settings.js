import AbstractView from "./AbstractView.js";

var myJSON = {}

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Settings");
    }

    async getHtml() {
        return `
            <div class="input">
                <label for="lang" style="grid-row: 1; grid-column: 1">Language: </label>
                <select name="language" class="can_be_changed" id="lang" style="grid-row: 1; grid-column: 2"></select>
                <label for="prefix" style="grid-row: 2; grid-column: 1">Prefix: </label>
                <input name="prefix" class="can_be_changed" type="text" style="grid-row: 2; grid-column: 2" id="prefix" value=""/>
            </div>
        `;
    }

    async executeViewScript(json) {
        myJSON = json
        let listening = document.getElementsByClassName("can_be_changed");
        for (let i = 0; i < listening.length; i++) {
            listening[i].addEventListener("input", (e) => {
                check()
            })
        }
        //inserting values
        const languages = ['ru', 'en']
        let select = document.createElement('option')
        select.value = json.lang
        select.text = json.lang
        document.getElementById("lang").append(select)
        for (let i = 0; i < languages.length; i++) {
            if (languages[i] !== json.lang) {
                select = document.createElement('option')
                select.value = languages[i]
                select.text = languages[i]
                document.getElementById("lang").append(select)
            }
        }
        document.getElementById("prefix").value = json.prefix
        document.getElementById("prefix").text = json.prefix
    }

    async getInputValues() {
        for (let key in myJSON) {
            myJSON[key] = document.getElementById(key).value
        }
        return myJSON
    }
}
