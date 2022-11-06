function setTheme (theme) {
  let body = document.getElementsByTagName('body')[0]
  if (!body) {
    return
  }
  if (theme == 'dark') {
    body.dataset.theme = 'dark'
  } else {
    body.dataset.theme = 'light'
  }
  localStorage.setItem('theme', body.dataset.theme)
}

document.getElementById('theme-switch-dark').addEventListener('click', function() {
  setTheme('dark')
})


document.getElementById('theme-switch-light').addEventListener('click',function() {
  setTheme('light')
})

if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  if (!localStorage.getItem('theme')) {
    setTheme()
  }
}

if (localStorage.getItem('theme')) {
  console.log(localStorage.getItem('theme'))
  setTheme(localStorage.getItem('theme'))
}
