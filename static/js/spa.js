import Personalize from "./views/Personalize.js";
import Commands from "./views/Commands.js";
import Settings from "./views/Settings.js";
import Admins from "./views/Admins.js";


let loaded = false
let mySettings
let mySettingsCopy
let myAdmins
let myAdminsCopy
let newAvatar

const routes = [
    {path: "/personalize", view: Personalize},
    {path: "/commands", view: Commands},
    {path: "/settings", view: Settings},
    {path: "/admins", view: Admins},
]

async function getMatch() {
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

const navigateTo = url => {
    history.pushState(null, null, url)
    router()
}

const router = async () => {
    if (!loaded) {
        const xhr = new XMLHttpRequest()
        xhr.onload = function () {
            load(this);
        }
        xhr.open("GET", "settings.json")
        xhr.send(null)
    } else await drawPage()

    async function load(xhr) {
        const jhr = new XMLHttpRequest()
        jhr.onload = function () {
            load2(xhr, this)
        }
        jhr.open("GET", "admin_list.json")
        jhr.setRequestHeader('req-admin', 'all')
        jhr.send(null)
    }

    async function load2(xhr, jhr) {
        mySettings = JSON.parse(xhr.responseText)
        myAdmins = JSON.parse(jhr.responseText)
        mySettingsCopy = JSON.parse(xhr.responseText)
        myAdminsCopy = JSON.parse(jhr.responseText)
        loaded = true
        await drawPage()
    }

    async function drawPage() {
        const match = await getMatch()
        const view = new match.route.view(getParams(match))
        const route = match.route.path.slice(1)
        let wasntChanged = true
        for (let key in mySettings) {
            if (key !== route) {
                wasntChanged = wasntChanged && _.isEqual(mySettings[key], mySettingsCopy[key])
            }
        }
        console.log("Wasn't changed: " + wasntChanged)
        document.querySelector("#main-page").innerHTML = await view.getHtml()
        if (route === 'admins') {
            await view.executeViewScript(mySettingsCopy[route], myAdminsCopy)
        } else if (route === 'personalize') {
            await view.executeViewScript(mySettingsCopy[route], newAvatar)
        } else {
            await view.executeViewScript(mySettingsCopy[route])
        }
    }
}
const getInput = async () => {
    const match = await getMatch()
    const route = match.route.path.slice(1)
    const view = new match.route.view(getParams(match))
    if (route === 'admins') {
        const info = await view.getInputValues()
        mySettingsCopy[route] = info[0]
        myAdminsCopy = info[1]
    } else if (route === 'personalize') {
        const info = await view.getInputValues()
        mySettingsCopy[route] = info[0]
        newAvatar = info[1]
    } else {
        mySettingsCopy[route] = await view.getInputValues()
    }
}

window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", e => {
        if (e.target.matches("[data-link]")) {
            e.preventDefault()
            getInput()
            navigateTo(e.target.id)
        }
    })
    router()
})