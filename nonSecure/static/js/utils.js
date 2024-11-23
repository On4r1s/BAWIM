export const ShSaveChangesMenu = (wasntChangedOther, myJSON, json) => {
    const confirmationEl = document.getElementById('confirmation')
    if (!(wasntChangedOther && _.isEqual(myJSON, json))) {
        confirmationEl.style.display = 'flex'
        if (!confirmationEl.classList.contains('confirmation-sh')) {
            confirmationEl.classList.add('confirmation-sh')
            //quick change fix
            setTimeout(function () {
                confirmationEl.style.display = 'flex'
            }, 200)
        }
        window.onbeforeunload = function () {
            return ''
        }
    } else {
        confirmationEl.classList.replace('confirmation-sh', 'confirmation-hide')
        setTimeout(function () {
            confirmationEl.classList.remove('confirmation-hide')
            confirmationEl.style.display = 'none'
        }, 200)
        window.onbeforeunload = function () {
        }
    }
}

export const shLogOut = () => {
    const menu = document.getElementById('log-out-menu')
    menu.style.top = null
    if (!menu.classList.contains('log-out-sh')) {
        menu.classList.add('log-out-sh')
        menu.addEventListener('animationend', () => {
            menu.style.top = '7%'
        })
    } else {
        menu.classList.replace('log-out-sh', 'log-out-hide')
        menu.addEventListener('animationend', () => {
            menu.style.top = '0'
            menu.classList.remove('log-out-hide')
        })
    }
}

export const shInfoMenu = (mess, color) => {
    const infoEl = document.createElement('div')
    infoEl.classList.add('info')
    infoEl.innerText = mess.replace(/_+/g, ' ')
    infoEl.style.display = 'flex'
    infoEl.style.border = `3px solid ${color}`
    let pad = 10 * (2 - parseInt((mess.length / 10).toString()) + 1)
    if (pad <= 0) {
        pad = 5
        infoEl.style.height = '110px'
        infoEl.style.width = '14%'
    }
    infoEl.style.padding = `${pad}px 5px`
    document.body.append(infoEl)
    infoEl.classList.add('info-sh')
    infoEl.addEventListener('animationend', () => {
        document.body.removeChild(infoEl)
    })
}

export const Confirm = {
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

export const logOut = () => {
    shInfoMenu('Logged Out', '#2eb639')
    document.getElementById('log-out').click()
}

let prevPath = ''

export const leftMenu = (path) => {
    try {
        if (path !== 'login') {
            document.getElementById(path).style.background = '#5865f2'
            if (prevPath !== '') {
                document.getElementById(path).style = null
            }
            prevPath = path
        } else {
            try {
                document.getElementById("navigate-buttons").remove()
            } catch (e) {

            }
        }
    } catch (e) {
        document.getElementById("navigate-menu").innerHTML = `
            <div id="navigate-buttons">
                <a href="/personalize" class="btn-menu" id="personalize" data-link>Personalize Bot</a>
                <a href="/commands" class="btn-menu" id="commands" data-link>Bot Commands</a>
                <a href="/settings" class="btn-menu" id="settings" data-link>Bot Settings</a>
                <a href="/admins" class="btn-menu" id="admins" data-link>Admins</a>
            </div>`
    }
}