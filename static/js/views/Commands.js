import AbstractView from "./AbstractView.js"
import {ShSaveChangesMenu} from "../utils.js"

let myJSON

export default class extends AbstractView {
    constructor(params) {
        super(params)
        this.setTitle("Commands")
    }

    async getHtml() {
        return `
            <div class="input" id="in"></div>
        `
    }

    async executeViewScript(json, jsonCopy, wasntChangedOther) {
        myJSON = jsonCopy
        ShSaveChangesMenu(wasntChangedOther, myJSON, json)
        // inserting values
        for (let key1 in myJSON) {
            if (JSON.stringify(myJSON[key1]) !== '{}') {
                const commandType = document.createElement('b')
                commandType.className = "command-type"
                commandType.textContent = key1.charAt(0).toUpperCase() + key1.slice(1)
                document.getElementById("in").append(commandType)
                for (let key2 in myJSON[key1]) {
                    const label1 = document.createElement('label')
                    label1.htmlFor = key2
                    label1.style.gridRow = 'auto'
                    label1.style.gridColumn = '1'
                    label1.textContent = key2.replaceAll("_", " ").replace("command", "")
                    const label2 = document.createElement('label')
                    label2.style.gridRow = 'auto'
                    label2.style.gridColumn = '2'
                    label2.className = 'switch'
                    const input = document.createElement('input')
                    input.className = 'can-be-changed'
                    input.id = key2
                    input.name = key2
                    input.style.gridRow = 'auto'
                    input.style.gridColumn = '2'
                    input.type = 'checkbox'
                    input.checked = myJSON[key1][key2] === 1
                    const span = document.createElement('span')
                    span.style.gridRow = 'auto'
                    span.style.gridColumn = '2'
                    span.className = 'slider round'
                    label2.append(input)
                    label2.append(span)
                    document.getElementById("in").append(label1)
                    document.getElementById("in").append(label2)
                    input.addEventListener("input", (e) => {
                        if (input.checked) {
                            myJSON[key1][key2] = 1
                        } else {
                            myJSON[key1][key2] = 0
                        }
                        ShSaveChangesMenu(wasntChangedOther, myJSON, json)
                    })
                }
            }
        }
    }

    async getInputValues() {
        return [myJSON]
    }
}