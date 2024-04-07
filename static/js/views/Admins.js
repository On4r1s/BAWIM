import AbstractView from "./AbstractView.js";

let myid = "359412965843140609" //change
let myJSON = {}
let myAdmins = {}

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Admins");
    }

    async getHtml() {
        return `
            <b class="command_type" style="font-size: 23px">Active admins</b>
            <div class="input" id="in" style="display: grid"></div>
            <div id="add" style="display: flex; align-items: center; justify-content: start">
                <button type="button" id="add_button" class="add_button">+</button>
            </div>
        `;
    }

    async executeViewScript(json, admins) {
        myJSON = json
        myAdmins = admins
        let add_button = document.getElementById("add_button")
        add_button.addEventListener("mouseover", (e) => {
            e.target.style.background = "#4e5057";
        })
        add_button.addEventListener("mouseout", (e) => {
            e.target.style.background = "#36383f";
        })
        add_button.addEventListener("click", (e) => {
            let addDiv = document.getElementById("add")
            let input = document.createElement('input')
            input.placeholder = 'discord id(not username)'
            input.className = 'can_be_changed'
            add_button.hidden = true
            let XButton = document.createElement('button')
            XButton.id = 'XButton'
            XButton.textContent = 'X'
            XButton.style.background = 'darkred'
            XButton.className = 'my_button'
            let OKButton = document.createElement('button')
            OKButton.id = 'XButton'
            OKButton.textContent = '✓'
            OKButton.style.background = 'green'
            OKButton.className = 'my_button'
            addDiv.append(input)
            addDiv.append(XButton)
            addDiv.append(OKButton)

            function hide() {
                OKButton.remove()
                XButton.remove()
                input.remove()
                add_button.hidden = false
            }

            XButton.addEventListener("click", (e) => {
                hide()
            })
            OKButton.addEventListener("click", (e) => {
                hide()
                const xhr = new XMLHttpRequest()
                xhr.onload = function () {
                    const date = new Date()
                    let day = date.getDate()
                    let month = date.getMonth() + 1
                    let year = date.getFullYear()
                    let currentDate = `${year}-${('0' + month).slice(-2)}-${('0' + day).slice(-2)}`
                    myJSON[input.value] = {"Role": "Admin", "InvitedBy": myid, "InviteDate": currentDate}
                    myAdmins[input.value] = JSON.parse(xhr.responseText)[input.value]
                    insertAdmin(input.value)
                }
                xhr.open("GET", "admin_list.json")
                xhr.setRequestHeader('req-admin', input.value)
                xhr.send(null)
            })


        })
        //inserting values
        for (let key in admins) {
            insertAdmin(key)
        }

        function insertAdmin(key) {
            //info
            let discUser = admins[key]
            let myUser = json[key]
            let userDiv = document.getElementById('in')
            let usernameDiv = document.createElement('div')
            usernameDiv.style.gridColumn = '1'
            usernameDiv.textContent = '●  ' + discUser.username
            usernameDiv.className = 'admins'
            let avatarDiv = document.createElement('div')
            avatarDiv.style.gridColumn = '2'
            let userAvatar = document.createElement('img')
            userAvatar.src = `https://cdn.discordapp.com/avatars/${discUser.id}/${discUser.avatar}.webp?size=100`
            userAvatar.alt = "ava"
            userAvatar.width = 50
            userAvatar.height = 50
            userAvatar.style.alignSelf = 'center'
            userAvatar.style.borderRadius = '25px'
            avatarDiv.append(userAvatar)
            let roleDiv = document.createElement('div')
            roleDiv.style.gridColumn = '3'
            roleDiv.className = 'admins'
            roleDiv.style.fontSize = '16px'
            roleDiv.textContent = 'Role: ' + myUser.Role
            let inviteDiv = document.createElement('div')
            inviteDiv.style.gridColumn = '4'
            inviteDiv.className = 'admins'
            inviteDiv.style.fontSize = '16px'
            inviteDiv.textContent = 'Invited by: ' + myUser.InvitedBy
            let dateDiv = document.createElement('div')
            dateDiv.style.gridColumn = '5'
            dateDiv.className = 'admins'
            dateDiv.style.fontSize = '16px'
            dateDiv.textContent = 'Invite date: ' + myUser.InviteDate
            userDiv.append(usernameDiv)
            userDiv.append(avatarDiv)
            userDiv.append(roleDiv)
            userDiv.append(inviteDiv)
            userDiv.append(dateDiv)
            //delete button
            let buttonDiv = document.createElement('div')
            buttonDiv.style.gridColumn = '6'
            buttonDiv.style.display = 'flex'
            buttonDiv.style.justifyContent = 'center'
            buttonDiv.style.alignItems = 'center'
            if (myUser.Role !== 'Owner') {
                let button = document.createElement('button')
                button.id = 'delete_' + discUser.id
                button.textContent = 'X'
                button.style.background = 'darkred'
                button.className = 'my_button'
                buttonDiv.append(button)
                userDiv.append(buttonDiv)
                button.addEventListener("click", (e) => {
                    delete admins[key]
                    delete json[key]
                    usernameDiv.remove()
                    avatarDiv.remove()
                    roleDiv.remove()
                    inviteDiv.remove()
                    dateDiv.remove()
                    buttonDiv.remove()
                })
            }
        }
    }

    async getInputValues() {
        return [myJSON, myAdmins]
    }
}