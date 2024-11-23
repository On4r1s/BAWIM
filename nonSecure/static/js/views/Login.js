import AbstractView from "./AbstractView.js"
import {shInfoMenu} from "../utils.js";

export default class extends AbstractView {
    constructor(params) {
        super(params)
        this.setTitle("Login")
    }

    async getHtml() {
        return `
            <div id="login-form">
                <a id="login" class="login-button" href="https://discord.com/oauth2/authorize?client_id=823239631340044289&response_type=token&redirect_uri=http%3A%2F%2F127.0.0.1%3A5000%2Flogin&scope=identify">
                login via Discord</a>
            </div>
        `
    }

    async executeViewScript(input) {
        const makeState = () => {
            let size = 10
            let id = ''
            let bytes = crypto.getRandomValues(new Uint8Array(size))

            while (size--) {
                let byte = bytes[size] & 63
                if (byte < 36) {
                    // `0-9a-z`
                    id += byte.toString(36)
                } else if (byte < 62) {
                    // `A-Z`
                    id += (byte - 26).toString(36).toUpperCase()
                } else if (byte < 63) {
                    id += '_'
                } else {
                    id += '-'
                }
            }
            localStorage.setItem('oauth-state', id)
            document.getElementById('login').href += `&state=${btoa(id)}`
        }

        if (!input) {
            return makeState()
        } else if (input === 'clickjacked') {
            document.getElementById('login').href += `&state=${btoa(localStorage.getItem('oauth-state'))}`
            return shInfoMenu('You may have been clickjacked!', '#e33a3f')
        } else if (input === 403) {
            document.getElementById('login').href += `&state=${btoa(localStorage.getItem('oauth-state'))}`
            return shInfoMenu("You don't have permissions!\nUse another account", '#e33a3f')
        } else if (input === 200) {
            shInfoMenu('Successful login', '#2eb639')
            document.getElementById('login').remove()
            const el = document.createElement('b')
            el.innerText = 'Checking...'
            document.getElementById('login-form').append(el)
        } else {
            localStorage.clear()
            makeState()
            return shInfoMenu("What have you done?!", '#e33a3f')
        }
    }
}