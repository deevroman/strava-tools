// ==UserScript==
// @name        Copy strava.com cookies
// @description Add Download Vespucci config into dropdown menu
// @version     0.2
// @author      deevroman
// @namespace   https://github.com/deevroman/strava-tools
// @updateURL   https://github.com/deevroman/strava-tools/raw/master/strava.user.js
// @downloadURL https://github.com/deevroman/strava-tools/raw/master/strava.user.js
// @match       https://www.strava.com/*
// @grant       GM.cookie
// @grant       GM_registerMenuCommand
// @grant       GM_setClipboard
// @run-at      document-end
// ==/UserScript==

async function downloadCookies() {
  const cookies = (await GM.cookie.list())
      .filter(i => [
          'CloudFront-Key-Pair-Id',
          'CloudFront-Policy',
          'CloudFront-Signature',
          '_strava_idcf'].includes(i.name)
      )
      .map(i => `${i.name}=${i.value}`).join(";").replace('"', '&quot;')
  if (!cookies.includes("CloudFront-Key-Pair-Id")) {
    alert("Enable full access to HttpOnly cookies in settings")
  }
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
  const link = document.createElement("a")
  link.href = URL.createObjectURL(new Blob([xml], { type: "application/xml" }))
  link.download = "strava-cookies-" + (new Date()).toISOString() + ".xml"
  link.style.display = "none"
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(link.href))
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
        if (e.target.nodeName === "DIV") {
          e.preventDefault()
        }
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
