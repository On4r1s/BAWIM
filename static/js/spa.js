import Personalize from "./views/Personalize.js";
import Commands from "./views/Commands.js";
import Settings from "./views/Settings.js";
import Admins from "./views/Admins.js";


var loaded = false
var mySettings = ''
var myAdmins = ''


const pathToRegex = path => new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$");

const getParams = match => {
    const values = match.result.slice(1);
    const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map(result => result[1]);

    return Object.fromEntries(keys.map((key, i) => {
        return [key, values[i]];
    }));
};

const navigateTo = url => {
    history.pushState(null, null, url);
    router();
};

const router = async () => {
    const routes = [
        {path: "/personalize", view: Personalize},
        {path: "/commands", view: Commands},
        {path: "/settings", view: Settings},
        {path: "/admins", view: Admins},
    ];
    if (!loaded) {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
            load(this);
        }
        xhr.open("GET", "settings.json");
        xhr.send(null);
    }
    else await drawPage()

    async function load(xhr) {
        const jhr = new XMLHttpRequest();
        jhr.onload = function () {
            load2(xhr, this);
        }
        jhr.open("GET", "admin_list.json");
        jhr.send(null);
    }

    async function load2(xhr, jhr) {
        mySettings = JSON.parse(xhr.responseText)
        myAdmins = JSON.parse(jhr.responseText)
        loaded = true
        await drawPage()
    }

    async function drawPage() {
        const potentialMatches = routes.map(route => {
            return {
                route: route,
                result: location.pathname.match(pathToRegex(route.path))
            };
        });

        let match = potentialMatches.find(potentialMatch => potentialMatch.result !== null);

        if (!match) {
            match = {
                route: routes[0],
                result: [location.pathname]
            };
        }

        const view = new match.route.view(getParams(match));
        let route = match.route.path.slice(1)
        if (route === 'admins') {
            document.querySelector("#main-page").innerHTML = await view.getHtml(myAdmins);
            await view.executeViewScript(mySettings[route], myAdmins);
        } else {
            document.querySelector("#main-page").innerHTML = await view.getHtml();
            await view.executeViewScript(mySettings[route]);
        }



    }
};

window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", e => {
        if (e.target.matches("[data-link]")) {
            e.preventDefault();
            navigateTo(e.target.id);
        }
    });

    router();
});