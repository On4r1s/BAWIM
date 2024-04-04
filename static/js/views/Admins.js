import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Admins");
    }

    async getHtml() {
        return `
            <b class="command_type" style="font-size: 23px">Active admins</b>
            <div class="input" id="in"></div>
            <div id="add">
                <button type="button" id="add_button" class="add_button">+</button>
            </div>
        `;
    }

    async executeViewScript(json, admins) {
        let listening = document.getElementsByClassName("can_be_changed");
        for (let i = 0; i < listening.length; i++) {
            listening[i].addEventListener("input", (e) => {
                alert('get fucked moron L');
            })
        }
        let add_button = document.getElementById("add_button");
        add_button.addEventListener("mouseover", (e) => {
            e.target.style.background = "#4e5057";
        })
        add_button.addEventListener("mouseout", (e) => {
            e.target.style.background = "#36383f";
        })
        add_button.addEventListener("click", (e) => {
            let input = document.createElement('input')
            input.placeholder = 'discord id(not username)'
            input.className = 'can_be_changed'
            add_button.hidden = true
            document.getElementById("add").append(input)
        })
        //inserting values
        for (let key in admins) {
            let discUser = admins[key]
            let myUser = json[key]
            console.log(myUser)
            let userDiv = document.createElement('div')
            userDiv.style.gridRow = 'auto'
            userDiv.style.display = 'grid'
            let usernameDiv = document.createElement('div')
            usernameDiv.style.gridRow = 'auto'
            usernameDiv.style.gridColumn = '1'
            usernameDiv.textContent = '●  ' + discUser.username
            usernameDiv.className = 'admins'
            let avatarDiv = document.createElement('div')
            avatarDiv.style.gridRow = 'auto'
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
            roleDiv.style.gridRow = 'auto'
            roleDiv.style.gridColumn = '3'
            roleDiv.className = 'admins'
            roleDiv.style.fontSize = '16px'
            roleDiv.textContent = 'Role: ' + myUser.Role
            let inviteDiv = document.createElement('div')
            inviteDiv.style.gridRow = 'auto'
            inviteDiv.style.gridColumn = '4'
            inviteDiv.className = 'admins'
            inviteDiv.style.fontSize = '16px'
            inviteDiv.textContent = 'Invited by: ' + myUser.InvitedBy
            let dateDiv = document.createElement('div')
            dateDiv.style.gridRow = 'auto'
            dateDiv.style.gridColumn = '5'
            dateDiv.className = 'admins'
            dateDiv.style.fontSize = '16px'
            dateDiv.textContent = 'Invite date: ' + myUser.InviteDate
            userDiv.append(usernameDiv)
            userDiv.append(avatarDiv)
            userDiv.append(roleDiv)
            userDiv.append(inviteDiv)
            userDiv.append(dateDiv)
            document.getElementById("in").append(userDiv)
        }
    }
}