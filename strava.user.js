// ==UserScript==
// @name        Copy strava.com cookies
// @description Add Download Vespucci config into dropdown menu
// @version     0.1
// @author      deevroman
// @namespace   https://github.com/deevroman/strava-tools
// @updateURL   https://github.com/deevroman/strava-tools/raw/master/strava.user.js
// @downloadURL https://github.com/deevroman/strava-tools/raw/master/strava.user.js
// @match       https://www.strava.com/*
// @grant       GM.cookie
// @grant       GM_registerMenuCommand
// @grant       GM_setClipboard
// @grant       GM_download
// @run-at      document-end
// ==/UserScript==

async function downloadCookies() {
  const cookies = (await GM.cookie.list()).map(i => `${i.name}=${i.value}`).join(";").replace('"', '&quot;')
  const xml = `<?xml version='1.0' encoding='UTF-8' ?>
<Configuration>
    <Section name="tilelayers" table="headers"
version="0.1" truncate="false">
        <ColumnTypes id="TEXT" name="TEXT"
value="TEXT" />
        <PrimaryKeyColumns />
        <Row id="Stravacookies" name="Cookie"
value="${cookies}"/>
    </Section>
</Configuration>
`
  GM_setClipboard(xml)
  GM_download("data:application/xml;base64," + btoa(xml), "strava-cookies-" + (new Date()).toISOString() + ".xml")
}

GM_registerMenuCommand("Get XML with cookies for Vespucci", downloadCookies)

setTimeout(async () => {
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 500))
    const menu = document.querySelector('[href="/athletes/search"]').parentElement.parentElement
    if (menu.classList.contains("listen")){
      continue
    }
    menu.classList.add("listen")
    const li = document.createElement("li")
    const a = document.createElement("a")
    a.setAttribute("href", "")
    li.appendChild(a)
    a.textContent = "Download Vespucci config"
    menu.prepend(li)

    const avatar = document.querySelector('[href^="/athletes/"]:has(img)')
    if (avatar) {
      avatar.parentElement.onclick = e => {
        e.preventDefault()
      }
      avatar.parentElement.oncontextmenu = e => {
        e.preventDefault()
        void downloadCookies()
      }
    }
    a.onclick = e => {
      e.preventDefault()
      void downloadCookies()
    }
  }
})
