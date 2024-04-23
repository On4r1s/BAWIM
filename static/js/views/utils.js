export function ShSaveChangesMenu(wasntChangedOther, myJSON, json) {
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
        confirmationEl.classList.remove('confirmation-sh')
        confirmationEl.classList.add('confirmation-hide')
        setTimeout(function () {
            confirmationEl.classList.remove('confirmation-hide')
            confirmationEl.style.display = 'none'
        }, 200)
        window.onbeforeunload = function () {
        }
    }
}

export function shInfoMenu(mess, color) {
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
    setTimeout(function () {
        infoEl.classList.remove('info-sh')
        infoEl.classList.add('info-hide')
    }, 5000)
    setTimeout(function () {
        infoEl.remove()
    }, 5200)
}