import AbstractView from "./AbstractView.js";

var myJSON = {}

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Commands");
    }

    async getHtml() {
        return `
            <div class="input" id="in"></div>
        `;
    }

    async executeViewScript(json) {
        myJSON = json
        //inserting values
        for (let key1 in json) {
            if (JSON.stringify(json[key1]) !== '{}') {
                let command_type = document.createElement('b')
                command_type.className = "command_type"
                command_type.textContent = key1.charAt(0).toUpperCase() + key1.slice(1)
                document.getElementById("in").append(command_type)
                for (let key2 in json[key1]) {
                    let label1 = document.createElement('label')
                    label1.htmlFor = key2
                    label1.style.gridRow = 'auto'
                    label1.style.gridColumn = '1'
                    label1.textContent = key2.replaceAll("_", " ").replace("command", "")
                    let label2 = document.createElement('label')
                    label2.style.gridRow = 'auto'
                    label2.style.gridColumn = '2'
                    label2.className = 'switch'
                    let input = document.createElement('input')
                    input.className = 'can_be_changed'
                    input.id = key2
                    input.name = key2
                    input.style.gridRow = 'auto'
                    input.style.gridColumn = '2'
                    input.type = 'checkbox'
                    input.checked = json[key1][key2] === 1;
                    let span = document.createElement('span')
                    span.style.gridRow = 'auto'
                    span.style.gridColumn = '2'
                    span.className = 'slider round'
                    label2.append(input)
                    label2.append(span)
                    document.getElementById("in").append(label1)
                    document.getElementById("in").append(label2)
                }
            }
        }
    }

    async getInputValues() {
        for (let key1 in myJSON) {
            for (let key2 in myJSON[key1]){
                if (document.getElementById(key2).checked){
                    myJSON[key1][key2] = 1
                } else {
                    myJSON[key1][key2] = 0
                }
            }
        }
        return myJSON
    }
}