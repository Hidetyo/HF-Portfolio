var lang = localStorage.getItem("HFPortfolio_lang");
if (lang) {
  switchLang(lang);
} else {
  if (window.navigator.language == "ja") {
    switchLang('ja');
  }
  else {
    switchLang('en')
  }
}

window.onload = function () {
  document.body.style.visibility = "visible";
  openTab('all');
};

function openTab(tabName) {
  const elements = document.querySelectorAll(`.research, .hobby`);
  for (let i = 0; i < elements.length; i++) {
    elements[i].style.display = 'none';
  }
  if (tabName == 'all') {
    const dispelements = document.querySelectorAll(`.research, .hobby`);
    for (let i = 0; i < elements.length; i++) {
      dispelements[i].style.display = 'inline';
    }
  }
  else {
    const dispelements = document.querySelectorAll(`.${tabName}`);
    for (let i = 0; i < elements.length; i++) {
      dispelements[i].style.display = 'inline';
    }
  }
}

function switchLang(lang) {
  var i, langElements;
  langElements = document.getElementsByClassName("lang-" + lang);
  for (i = 0; i < langElements.length; i++) {
    langElements[i].style.display = "block";
  }
  langElements = document.getElementsByClassName("lang-" + (lang === "en" ? "ja" : "en"));
  for (i = 0; i < langElements.length; i++) {
    langElements[i].style.display = "none";
  }
  localStorage.setItem("HFPortfolio_lang", lang);
}

if (document.URL.match(index.html)) {
  const hamburgerButton = document.querySelector('.hamburger-button');
  const navMenu = document.querySelector('.nav-menu');

  hamburgerButton.addEventListener('click', () => {
    hamburgerButton.classList.toggle('active');
    navMenu.classList.toggle('active');
  });
}