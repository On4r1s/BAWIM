import AbstractView from "./AbstractView.js"
import {ShSaveChangesMenu} from "../utils.js"

let myJSON

export default class extends AbstractView {
    constructor(params) {
        super(params)
        this.setTitle("Settings")
    }

    async getHtml() {
        return `
            <div class="input">
                <label for="lang" style="grid-row: 1; grid-column: 1">Language: </label>
                <select name="language" class="can-be-changed" id="lang" style="grid-row: 1; grid-column: 2"></select>
                <label for="prefix" style="grid-row: 2; grid-column: 1">Prefix: </label>
                <input name="prefix" class="can-be-changed" type="text" style="grid-row: 2; grid-column: 2" id="prefix" value=""/>
            </div>
        `
    }

    async executeViewScript(json, jsonCopy, wasntChangedOther) {
        myJSON = jsonCopy
        ShSaveChangesMenu(wasntChangedOther, myJSON, json)
        const language = document.getElementById("lang")
        const regChars = /^[^"'`\s\0\x07\x08\x0B\x0C\x0E-\x1F]{1,3}$/
        const prefix = document.getElementById('prefix')
        language.addEventListener("input", () => {
            myJSON.lang = language.value
            ShSaveChangesMenu(wasntChangedOther, myJSON, json)
        })
        prefix.addEventListener("input", () => {
            if (!((1 <= prefix.value.length) && (3 >= prefix.value.length))) {
                prefix.setCustomValidity("must be 1-3 characters")
                prefix.reportValidity()
            } else if (!(regChars.test(prefix.value))) {
                prefix.setCustomValidity("illegal character(s)")
                prefix.reportValidity()
            } else {
                prefix.setCustomValidity("")
                myJSON.prefix = prefix.value
                ShSaveChangesMenu(wasntChangedOther, myJSON, json)
            }
        })
        // inserting values
        const languages = ['ru', 'en']
        let select = document.createElement('option')
        select.value = myJSON.lang
        select.text = myJSON.lang
        document.getElementById("lang").append(select)
        for (let i = 0; i < languages.length; i++) {
            if (languages[i] !== myJSON.lang) {
                select = document.createElement('option')
                select.value = languages[i]
                select.text = languages[i]
                document.getElementById("lang").append(select)
            }
        }
        prefix.value = myJSON.prefix
    }

    async getInputValues() {
        return [myJSON]
    }
}
