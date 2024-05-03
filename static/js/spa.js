import Personalize from "./views/Personalize.js"
import Commands from "./views/Commands.js"
import Settings from "./views/Settings.js"
import Admins from "./views/Admins.js"
import Login from "./views/Login.js";
import {logOut, shInfoMenu, shLogOut, leftMenu} from "./utils.js"

let settings, settingsCopy
let admins, adminsCopy
let avatar
let prevPage = ''

// pages
const routes = [
    {path: "/personalize", view: Personalize},
    {path: "/commands", view: Commands},
    {path: "/settings", view: Settings},
    {path: "/admins", view: Admins},
    {path: "/login", view: Login}
]

const navigateTo = async (url) => {
    history.pushState(null, null, url)
    await router()
}

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
        return navigateTo(routes[0])
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

const getData = async () => {
    const info = JSON.parse(localStorage.getItem('user-info'))
    const accessToken = localStorage.getItem('access-token')
    const tokenType = localStorage.getItem('access-type')
    // styling
    document.getElementById('username').innerHTML = info.username
    document.getElementById('user-avatar').src = `https://cdn.discordapp.com/avatars/${info.id}/${info.avatar}.png?size=100`
    shLogOut()
    let settingsRequest
    try {
        settingsRequest = await axios({
            method: 'get',
            url: '/settings.json',
            headers: {
                'id': info.id,
                'access-token': accessToken,
                'token-type': tokenType
            }
        })
    } catch (e) {
        return e
    }
    const adminsRequest = await axios({
        method: 'get',
        url: '/admin_list.json',
        headers: {
            'req-admin': 'all',
            'id': info.id,
            'access-token': accessToken,
            'token-type': tokenType
        }
    })
    return [settingsRequest, adminsRequest]
}

const setVariables = (data) => {
    settings = data[0].data
    admins = data[1].data
    settingsCopy = structuredClone(settings)
    adminsCopy = structuredClone(admins)
    avatar = settings['personalize']['avatar']
}

// changing page
const router = async () => {
    const loginInfo = JSON.parse(localStorage.getItem('user-info'))
    if (loginInfo === null && window.location.href.slice(22, 27) !== "login") {
        return navigateTo("/login")
    }
    if (loginInfo !== null && window.location.href.slice(22, 27) === "login") {
        if (settings === undefined) {
            const data = await getData()
            try {
                data.response.status // triggers error if user is authorized
                // -> login
                const match = await getMatch()
                const view = new match.route.view(getParams(match))
                document.getElementById('main-page').innerHTML = await view.getHtml()
                return await view.executeViewScript(403)
            } catch (e) {
                setVariables(data)
            }
        }
        return navigateTo("/personalize")
    }
    const match = await getMatch()
    const view = new match.route.view(getParams(match))
    const route = match.route.path.slice(1)
    leftMenu(route)
    document.getElementById('main-page').innerHTML = await view.getHtml()
    if (route === 'login') {
        if (loginInfo === null) {
            const fragment = new URLSearchParams(window.location.hash.slice(1))
            const accessToken = fragment.get('access_token')
            const tokenType = fragment.get('token_type')
            const state = fragment.get('state')
            if (!accessToken) {
                return await view.executeViewScript()
            }
            if (localStorage.getItem('oauth-state') !== atob(decodeURIComponent(state))) {
                return await view.executeViewScript('clickjacked')
            }
            const result = await fetch('https://discord.com/api/users/@me', {
                headers: {
                    authorization: `${tokenType} ${accessToken}`
                }
            })
            const response = await result.json()
            localStorage.setItem('user-info', JSON.stringify(response))
            localStorage.setItem('access-token', accessToken)
            localStorage.setItem('access-type', tokenType)
        }
        const data = await getData()
        try {
            data.response.status // triggers error if user is authorized
            return await view.executeViewScript(data.response.status)
        } catch (e) {
            await view.executeViewScript(data[0].status)
            setVariables(data)
            return setTimeout(function a() {
                navigateTo("/personalize")
            }, 1000)
        }
    }
    if (settings === undefined) {
        const data = await getData()
        try {
            data.response.status
            shInfoMenu('Invalid credentials', '#e33a3f')
            return logOut()
        } catch (e) {
            setVariables(data)
        }
    }
    activeButton(route)
    const changes = []
    let i = 0
    for (let key in settings) {
        if (key !== route) {
            changes[i++] = _.isEqual(settings[key], settingsCopy[key])
        }
    }
    const isTrue = (val) => val === true
    const wasntChanged = changes.every(isTrue)
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
    if (_.isEqual(diff, {})) {
        shInfoMenu("don't you dare", '#e33a3f')
        return
    }
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
        const response = await axios({
            method: 'post',
            url: '/settings.json',
            headers: {
                'id': JSON.parse(localStorage.getItem('user-info')).id,
                'access-token': localStorage.getItem('access-token'),
                'token-type': localStorage.getItem('access-type'),
            },
            data: JSON.stringify(diff)
        })

        if (response.status === 204) {
            settingsCopy['personalize']['avatar'] = response.headers['img-name']
            settings = structuredClone(settingsCopy)
            admins = structuredClone(adminsCopy)
            avatar = response.headers['img-name']
            shInfoMenu('Successful', '#2eb639')
            await router()
        } else {
            shInfoMenu(`WTH? ${response.status.code}`, '#e33a3f')
        }
        window.onbeforeunload = function () {
        }
    } catch (e) {
        shInfoMenu(e.code, '#e33a3f')
        if (e.code === 401 || e.code === 403) {
            logOut()
        }
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

document.getElementById('log-out').addEventListener("click", async () => {
    shInfoMenu('Logged Out', '#2eb639')
    shLogOut()
    localStorage.clear()
    document.getElementById('username').innerHTML = '--'
    document.getElementById('user-avatar').src = "/static/who.png"
    await navigateTo('/login')
})

// styling
const activeButton = (route) => {
    try {
        if (prevPage !== '' && prevPage !== 'login') {
            document.getElementById(prevPage).style = null
        }
        document.getElementById(route).style.background = '#5865f2'
        prevPage = route
    } catch (e) {
    }
}

// making json to send
const findDifferences = (obj1, obj2) => {
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