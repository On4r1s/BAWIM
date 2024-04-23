import AbstractView from "./AbstractView.js"
import {ShSaveChangesMenu, shInfoMenu} from "./utils.js"

const id = "359412965843140609" // to change
let myJSON, myAdmins

export default class extends AbstractView {
    constructor(params) {
        super(params)
        this.setTitle("Admins")
    }

    async getHtml() {
        return `
            <b class="command-type">Active admins</b>
            <div class="input can-be-changed" id="in" style="display: grid"></div>
            <div id="add">
                <button type="button" id="btn-add" class="btn-add">+</button>
            </div>
        `
    }

    async executeViewScript(json, jsonCopy, wasntChangedOther, admins) {
        myJSON = jsonCopy
        myAdmins = admins
        ShSaveChangesMenu(wasntChangedOther, myJSON, json)
        // admin confirmation
        const Confirm = {
            open(options) {
                options = Object.assign({}, {
                    title: '',
                    message: '',
                    src: '',
                    onOK: function () {
                    },
                    onCancel: function () {
                    }
                }, options)

                const html = `
                            <div class="confirm">
                                <div class="confirm--window">
                                    <div class="confirm--titlebar">
                                        <span class="confirm--title">${options.title}</span>
                                        <button class="confirm--close">&times;</button>
                                    </div>
                                    <div class="confirm--content" style="display: flex; justify-content: center">
                                        <img src="${options.src}" alt="user avatar" style="height: 75px; width: 75px; align-self: center; border-radius: 38px"/>
                                    </div>
                                    <div class="confirm--content" style="text-align: center">${options.message}</div>
                                    <div class="confirm--btns">
                                        <button class="confirm--btn confirm--btn--ok">OK</button>
                                        <button class="confirm--btn confirm--btn--cancel">Cancel</button>
                                    </div>
                                </div>
                            </div>
                        `

                const template = document.createElement('template')
                template.innerHTML = html

                // elements
                const confirmEl = template.content.querySelector('.confirm')
                const btnClose = template.content.querySelector('.confirm--close')
                const btnOk = template.content.querySelector('.confirm--btn--ok')
                const btnCancel = template.content.querySelector('.confirm--btn--cancel')

                confirmEl.addEventListener('click', (e) => {
                    if (e.target === confirmEl) {
                        options.onCancel()
                        this.close(confirmEl)
                    }
                })

                btnOk.addEventListener('click', () => {
                    options.onOK()
                    this.close(confirmEl)
                });

                [btnCancel, btnClose].forEach(el => {
                    el.addEventListener('click', () => {
                        options.onCancel()
                        this.close(confirmEl)
                    })
                })

                document.body.appendChild(template.content)
            },

            close(confirmEl) {
                confirmEl.classList.add('confirm-close')

                confirmEl.addEventListener('animationend', () => {
                    document.body.removeChild(confirmEl)
                })
            }
        }

        const btnAdd = document.getElementById("btn-add")
        btnAdd.addEventListener("click", () => {
            btnAdd.hidden = true
            const addDiv = document.getElementById("add")
            const input = document.createElement('input')
            input.placeholder = 'discord id(not username)'
            const btnX = document.createElement('button')
            btnX.textContent = 'X'
            btnX.style.color = '#e33a3f'
            btnX.style.borderWidth = '2px'
            btnX.style.borderColor = '#e33a3f'
            btnX.className = 'btn'
            const btnOK = document.createElement('button')
            btnOK.textContent = '✓'
            btnOK.style.color = '#2eb639'
            btnOK.style.borderWidth = '2px'
            btnOK.style.borderColor = '#2eb639'
            btnOK.className = 'btn'
            btnOK.style.padding = '0'
            addDiv.append(input)
            addDiv.append(btnX)
            addDiv.append(btnOK)
            const regex = /^\d{1,19}$/
            input.addEventListener("input", () => {
                    if (!(regex.test(input.value))) {
                        input.setCustomValidity("illegal character(s)")
                        input.reportValidity()
                    } else if (!((17 <= input.value.length) && (19 >= input.value.length))) {
                        input.setCustomValidity("must be 17-19 numbers")
                        input.reportValidity()
                    } else {
                        input.setCustomValidity("")
                    }
                }
            )

            function hide() {
                btnOK.remove()
                btnX.remove()
                input.remove()
                btnAdd.hidden = false
            }

            btnX.addEventListener("click", () => {
                hide()
            })

            btnOK.addEventListener("click", () => {
                if (myJSON[input.value] !== undefined) {
                    shInfoMenu('Error: user is already added.', '#e33a3f')
                    return
                }
                axios({
                    method: 'get',
                    url: '/admin_list.json',
                    headers: {
                        'req-admin': input.value
                    }
                }).then(function (response) {
                    const info = response.data[input.value]
                    Confirm.open({
                        title: 'Add admin',
                        message: `Are you sure you want to add <b> ${info.username} </b> ?`,
                        src: `https://cdn.discordapp.com/avatars/${info.id}/${info.avatar}.webp?size=100`,
                        onOK: () => {
                            // UTC date format
                            const date = new Date()
                            const day = date.getUTCDate()
                            const month = date.getUTCMonth() + 1
                            const year = date.getUTCFullYear()
                            const currentDate = `${year}-${('0' + month).slice(-2)}-${('0' + day).slice(-2)}`
                            myJSON[input.value] = {"Role": "Admin", "InvitedBy": id, "InviteDate": currentDate}
                            myAdmins[input.value] = info
                            hide()
                            insertAdmin(input.value)
                            ShSaveChangesMenu(wasntChangedOther, myJSON, json)
                        }
                    })
                })
            })
        })

        // inserting values
        for (let key in admins) {
            insertAdmin(key)
        }

        function insertAdmin(key) {
            const discUser = admins[key]
            const myUser = myJSON[key]
            const userDiv = document.getElementById('in')
            const usernameDiv = document.createElement('div')
            usernameDiv.style.gridColumn = '1'
            usernameDiv.textContent = '●  ' + discUser.username
            usernameDiv.className = 'admins'
            const avatarDiv = document.createElement('div')
            avatarDiv.style.gridColumn = '2'
            const userAvatar = document.createElement('img')
            userAvatar.src = `https://cdn.discordapp.com/avatars/${discUser.id}/${discUser.avatar}.webp?size=100`
            userAvatar.alt = "User avatar"
            userAvatar.width = 50
            userAvatar.height = 50
            userAvatar.style.alignSelf = 'center'
            userAvatar.style.borderRadius = '25px'
            avatarDiv.append(userAvatar)
            const roleDiv = document.createElement('div')
            roleDiv.style.gridColumn = '3'
            roleDiv.className = 'admins'
            roleDiv.style.fontSize = '16px'
            roleDiv.textContent = 'Role: ' + myUser.Role
            const inviteDiv = document.createElement('div')
            inviteDiv.style.gridColumn = '4'
            inviteDiv.className = 'admins'
            inviteDiv.style.fontSize = '16px'
            let whom
            if (myUser.InvitedBy === 'Bot') whom = 'Bot'
            else whom = admins[myUser.InvitedBy].username
            inviteDiv.textContent = `Invited by: ${whom}`
            const dateDiv = document.createElement('div')
            dateDiv.style.gridColumn = '5'
            dateDiv.className = 'admins'
            dateDiv.style.fontSize = '16px'
            dateDiv.textContent = 'Invite date: ' + myUser.InviteDate
            userDiv.append(usernameDiv)
            userDiv.append(avatarDiv)
            userDiv.append(roleDiv)
            userDiv.append(inviteDiv)
            userDiv.append(dateDiv)

            const btnDel = document.createElement('div')
            btnDel.style.gridColumn = '6'
            btnDel.style.display = 'flex'
            btnDel.style.justifyContent = 'center'
            btnDel.style.alignItems = 'center'
            if (myUser.Role !== 'Owner') {
                const btn = document.createElement('button')
                btn.textContent = 'X'
                btn.style.color = '#e33a3f'
                btn.style.borderWidth = '2px'
                btn.style.borderColor = '#e33a3f'
                btn.className = 'btn'
                btnDel.append(btn)
                userDiv.append(btnDel)
                btn.addEventListener("click", () => {
                    Confirm.open({
                        title: 'Remove admin',
                        message: `Are you sure you want to remove <b> ${admins[key].username} </b> ?`,
                        src: `https://cdn.discordapp.com/avatars/${admins[key].id}/${admins[key].avatar}.webp?size=100`,
                        onOK: () => {
                            delete admins[key]
                            delete myJSON[key]
                            usernameDiv.remove()
                            avatarDiv.remove()
                            roleDiv.remove()
                            inviteDiv.remove()
                            dateDiv.remove()
                            btnDel.remove()
                            ShSaveChangesMenu(wasntChangedOther, myJSON, json)
                        }
                    })
                })
            }
        }
    }

    async getInputValues() {
        return [myJSON, myAdmins]
    }
}