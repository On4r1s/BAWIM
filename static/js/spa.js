import Personalize from "./views/Personalize.js"
import Commands from "./views/Commands.js"
import Settings from "./views/Settings.js"
import Admins from "./views/Admins.js"
import {shInfoMenu} from "./views/utils.js"

let loaded = false
let settings, settingsCopy
let admins, adminsCopy
let avatar

// pages
const routes = [
    {path: "/personalize", view: Personalize},
    {path: "/commands", view: Commands},
    {path: "/settings", view: Settings},
    {path: "/admins", view: Admins},
]

// active page
const getMatch = async () => {
    const potentialMatches = routes.map(route => {
        return {
            route: route,
            result: location.pathname.match(pathToRegex(route.path))
        }
    })

    let match = potentialMatches.find(potentialMatch => potentialMatch.result !== null);

    if (!match) {
        match = {
            route: routes[0],
            result: [location.pathname]
        }
    }
    return match
}

const pathToRegex = path => new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$")

const getParams = match => {
    const values = match.result.slice(1)
    const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map(result => result[1])

    return Object.fromEntries(keys.map((key, i) => {
        return [key, values[i]]
    }))
}

const navigateTo = async (url) => {
    history.pushState(null, null, url)
    await router()
}

// changing page
const router = async () => {
    if (!loaded) {
        const resp1 = await axios('/settings.json')
        const resp2 = await axios({
            method: 'get',
            url: '/admin_list.json',
            headers: {
                'req-admin': 'all'
            }
        })
        settings = structuredClone(resp1.data)
        settingsCopy = structuredClone(resp1.data)
        admins = structuredClone(resp2.data)
        adminsCopy = structuredClone(resp2.data)
        loaded = true
        avatar = settings['personalize']['avatar']
    }
    const isTrue = (val) => val === true
    const match = await getMatch()
    const view = new match.route.view(getParams(match))
    const route = match.route.path.slice(1)
    const changes = []
    let i = 0
    for (let key in settings) {
        if (key !== route) {
            changes[i++] = _.isEqual(settings[key], settingsCopy[key])
        }
    }
    const wasntChanged = changes.every(isTrue)
    document.getElementById('main-page').innerHTML = await view.getHtml()
    if (route === 'admins') await view.executeViewScript(settings[route], settingsCopy[route], wasntChanged, adminsCopy)
    else if (route === 'personalize') await view.executeViewScript(settings[route], settingsCopy[route], wasntChanged, avatar)
    else await view.executeViewScript(settings[route], settingsCopy[route], wasntChanged)

}

const getInput = async () => {
    const match = await getMatch()
    const route = match.route.path.slice(1)
    const info = await new match.route.view(getParams(match)).getInputValues()
    settingsCopy[route] = info[0]
    if (route === 'admins') adminsCopy = info[1]
    else if (route === 'personalize') avatar = info[1]
}

window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", async () => {
    document.body.addEventListener("click", async e => {
        if (e.target.matches("[data-link]")) {
            e.preventDefault()
            await getInput()
            await navigateTo(e.target.id)
        }
    })
    await router()
})

// confirm changes
const confirm = document.getElementById('confirm')
confirm.addEventListener("click", async () => {
    await getInput()
    const diff = findDifferences(settings, settingsCopy)
    if (avatar !== settings['personalize'].avatar) {
        diff['newimage'] = avatar.slice(22)
    }
    console.log(diff)
    const inputs = document.getElementsByClassName('can-be-changed')
    for (let i in inputs) {
        try {
            if (inputs[i].checkValidity() === false) {
                shInfoMenu('Invalid input', '#e33a3f')
                return
            }
        } catch (e) {
        }
    }
    try {
        const response = await axios.post('/settings.json', JSON.stringify(diff))
        if (response.status === 204) {
            settingsCopy['personalize']['avatar'] = response.headers['img-name']
            settings = structuredClone(settingsCopy)
            admins = structuredClone(adminsCopy)
            avatar = response.headers['img-name']
            shInfoMenu('Successful', '#2eb639')
            await router()
        } else {
            shInfoMenu(`Error: ${response.status.code}`, '#e33a3f')
        }
        window.onbeforeunload = function () {
        }
    } catch (e) {
        shInfoMenu(e.code, '#e33a3f')
    }
})

// cancel changes
const cancel = document.getElementById('cancel')
cancel.addEventListener("click", async () => {
    settingsCopy = structuredClone(settings)
    adminsCopy = structuredClone(admins)
    window.onbeforeunload = function () {
    }
    await router()
})

// styling
const btnMenu = document.getElementsByClassName("btn-menu")
let active = ''
for (let i = 0; i < btnMenu.length; i++) {
    if (btnMenu[i].getAttribute('href') === location.pathname) {
        btnMenu[i].style.background = '#5865f2'
        active = btnMenu[i].id
    }
    btnMenu[i].addEventListener("click", (e) => {
        document.getElementById(active).style = null // intended behaviour
        e.target.style.background = '#5865f2'
        active = e.target.id
    })
}

// making json to send
function findDifferences(obj1, obj2) {
    const diff = {}
    for (let key in obj1) {
        if (obj1.hasOwnProperty(key)) {
            if (obj2.hasOwnProperty(key)) {
                if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
                    const nestedDiff = findDifferences(obj1[key], obj2[key])
                    if (Object.keys(nestedDiff).length > 0) {
                        diff[key] = nestedDiff
                    }
                } else {
                    if (obj1[key] !== obj2[key]) {
                        diff[key] = obj2[key]
                    }
                }
            } else {
                diff[key] = obj1[key]
            }
        }
    }
    for (let key in obj1) {
        if (obj1.hasOwnProperty(key) && !obj2.hasOwnProperty(key)) {
            diff[key] = 'deleted'
        }
    }
    return diff
}